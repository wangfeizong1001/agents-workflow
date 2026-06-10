#!/usr/bin/env python3
# .claude/hooks/propose_claude_md.py
#
# Stop Hook: 每次 Claude Code 会话结束后，审查 git diff 对照 CLAUDE.md，
# 把建议写到 .claude/claude-md-review.md（不直接修改源文件）。
#
# 设计原则：
#   1. 防递归：环境变量 CLAUDE_MD_REVIEW_LOCK 标记无头会话
#   2. 优雅降级：无 claude CLI 时只列改动区域，不阻塞主流程
#   3. 路径安全：用 git rev-parse 定位根，避开 hook 工作目录不定
#   4. 跨平台：纯标准库，路径用 os.path.join / os.sep
#   5. 不抛异常阻塞：所有错误都吞掉，让 Claude 主会话正常结束
#
# 用法：
#   .claude/settings.json 里注册：
#   {
#     "hooks": {
#       "Stop": [{
#         "hooks": [{
#           "type": "command",
#           "command": "python .claude/hooks/propose_claude_md.py"
#         }]
#       }]
#     }
#   }
#
# 参数（环境变量，可选）：
#   CLAUDE_MD_REVIEW_FILE  审查输出文件，默认 .claude/claude-md-review.md
#   CLAUDE_MD_REVIEW_DIFF  diff 来源：HEAD~1（默认）/ staged+unstaged
#   CLAUDE_MD_REVIEW_MODEL 调用的模型，默认沿用 CLI 默认（建议 haiku 省 token）
#   CLAUDE_MD_REVIEW_DEBUG 设为 1 打印详细日志到 stderr
#   CLAUDE_MD_REVIEW_SKIP  设为 1 完全跳过（紧急停用）

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Set

# ---- 常量 ----------------------------------------------------------------

REVIEW_FILE_DEFAULT = ".claude/claude-md-review.md"
LOCK_VAR = "CLAUDE_MD_REVIEW_LOCK"
MAX_DIFF_CHARS = 12_000
PROMPT_VERSION = "1.1.0"


# ---- 工具函数 ------------------------------------------------------------


def debug(msg: str) -> None:
    if os.environ.get("CLAUDE_MD_REVIEW_DEBUG"):
        print(f"[claude-md-review] {msg}", file=sys.stderr)


def run(
    cmd: List[str],
    cwd: Optional[str] = None,
    input_text: Optional[str] = None,
    env: Optional[dict] = None,
    check: bool = False,
) -> subprocess.CompletedProcess:
    """跨平台 subprocess.run 包装。"""
    kwargs: dict = dict(
        cwd=cwd,
        input=input_text,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=check,
    )
    if env is not None:
        kwargs["env"] = env
    return subprocess.run(cmd, **kwargs)


def find_repo_root(start: Path) -> Optional[Path]:
    """用 git 向上找仓库根。"""
    try:
        r = run(["git", "rev-parse", "--show-toplevel"], cwd=str(start))
        if r.returncode == 0 and r.stdout.strip():
            return Path(r.stdout.strip())
    except FileNotFoundError:
        debug("git not found")
    return None


def collect_changed_files(root: Path, mode: str) -> List[str]:
    """根据 mode 取改动文件列表。"""
    if mode == "staged+unstaged":
        # staged
        r1 = run(["git", "diff", "--name-only", "--staged"], cwd=str(root))
        # unstaged（含未跟踪修改）
        r2 = run(["git", "diff", "--name-only"], cwd=str(root))
        files = set()
        files.update(f for f in r1.stdout.splitlines() if f)
        files.update(f for f in r2.stdout.splitlines() if f)
        return sorted(files)
    # default: HEAD~1
    r = run(["git", "diff", "--name-only", "HEAD~1", "--", ":/*"], cwd=str(root))
    return [f for f in r.stdout.splitlines() if f]


def collect_diff(root: Path, mode: str) -> str:
    if mode == "staged+unstaged":
        r1 = run(["git", "diff", "--staged"], cwd=str(root))
        r2 = run(["git", "diff"], cwd=str(root))
        return r1.stdout + r2.stdout
    r = run(["git", "diff", "HEAD~1", "--", ":/*"], cwd=str(root))
    return r.stdout


def find_claude_mds_for_files(root: Path, files: List[str]) -> Set[Path]:
    """对每个改动文件，向上找路径上所有 CLAUDE.md。"""
    found: Set[Path] = set()
    sep = os.sep
    for f in files:
        # 把 git 的 unix 风格路径转成 OS 原生
        rel = f.replace("/", sep)
        d = (root / rel).parent if not os.path.isabs(rel) else Path(rel).parent
        # 向上走，直到根
        try:
            d = d.resolve()
        except OSError:
            continue
        root_resolved = root.resolve()
        while True:
            candidate = d / "CLAUDE.md"
            if candidate.is_file():
                found.add(candidate)
            if d == root_resolved or d.parent == d:
                break
            d = d.parent
    return found


def claude_cli_available() -> bool:
    return shutil.which("claude") is not None


# ---- 审查 Prompt ---------------------------------------------------------

REVIEW_PROMPT_TEMPLATE = """\
You are reviewing whether the project's CLAUDE.md rule files need updates \
to reflect recent code changes.

For each CLAUDE.md file listed below, output ONE of:
- "No change needed" — if all conventions/commands/paths/gotchas in the \
file are still consistent with the diff
- "Propose edit" — with: file path, the lines/paragraph to change, \
and a one-sentence rationale. Only flag missing conventions, renamed \
paths, changed commands, or new gotchas.

Hard rules:
- Do NOT suggest stylistic rewrites, grammar fixes, or reorganization.
- Do NOT modify any file yourself. Write your review to {review_file} only.
- If a CLAUDE.md references a path/function/command that no longer exists \
in the diff, flag it as a "Propose edit" with the concrete replacement.
- If the diff is too small to tell (e.g. only formatting changes), say \
"No change needed".

Output format (Markdown):
```
# CLAUDE.md Review {timestamp}

## <path/to/CLAUDE.md>
<No change needed | Propose edit: ...>
<optional one-paragraph rationale>

## <path/to/CLAUDE.md>
...
```

## Git Diff ({diff_chars} chars)
```diff
{diff}
```

## Relevant CLAUDE.md Files ({md_count} files)
{md_contents}
"""


def build_prompt(diff: str, md_paths: List[Path], root: Path) -> str:
    md_blocks = []
    for md in sorted(md_paths):
        try:
            content = md.read_text(encoding="utf-8")
        except OSError:
            content = "(unreadable)"
        # 用相对路径展示，便于 Claude 理解
        try:
            rel = md.relative_to(root)
        except ValueError:
            rel = md
        md_blocks.append(f"=== {rel} ===\n{content}")
    return REVIEW_PROMPT_TEMPLATE.format(
        review_file=os.environ.get("CLAUDE_MD_REVIEW_FILE", REVIEW_FILE_DEFAULT),
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M"),
        diff_chars=len(diff),
        diff=diff,
        md_count=len(md_paths),
        md_contents="\n\n".join(md_blocks),
    )


# ---- 降级输出：无 claude CLI 时 ----------------------------------------

FALLBACK_TEMPLATE = """\
# CLAUDE.md Review {timestamp} (fallback mode)

> claude CLI {cli_status}，本次仅列出可能过时的区域，**未做 LLM 审查**。
> {fix_hint}

## 改动文件 ({file_count} 个)
{file_list}

## 涉及的 CLAUDE.md ({md_count} 个)
{md_list}

## 建议人工检查
- 上方每个 CLAUDE.md 是否仍引用了正确路径/函数/命令
- 新增约定是否已写入对应 CLAUDE.md
- 旧约定（diff 中被删除/重命名的）是否需要清除
"""


def write_fallback_review(
    review_path: Path,
    files: List[str],
    mds: List[Path],
    root: Path,
    cli_status: str = "未找到",
    fix_hint: str = "安装 Claude Code 后重新运行本 hook 即可获得完整审查。",
) -> None:
    def rel(p):
        try:
            return str(p.relative_to(root))
        except ValueError:
            return str(p)

    body = FALLBACK_TEMPLATE.format(
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M"),
        cli_status=cli_status,
        fix_hint=fix_hint,
        file_count=len(files),
        file_list="\n".join(f"- `{f}`" for f in files) or "  (无)",
        md_count=len(mds),
        md_list="\n".join(f"- `{rel(m)}`" for m in sorted(mds)) or "  (无)",
    )
    review_path.parent.mkdir(parents=True, exist_ok=True)
    review_path.write_text(body, encoding="utf-8")


# ---- 主流程 --------------------------------------------------------------


def main() -> int:
    # 0. 防递归
    if os.environ.get(LOCK_VAR):
        debug(f"LOCK set, skip")
        return 0
    # 紧急停用
    if os.environ.get("CLAUDE_MD_REVIEW_SKIP") == "1":
        return 0

    # 1. 定位项目根
    start = Path.cwd()
    root = find_repo_root(start)
    if root is None:
        debug(f"not in a git repo (cwd={start}), skip")
        return 0
    os.chdir(root)
    debug(f"repo root: {root}")

    # 2. 取 diff
    mode = os.environ.get("CLAUDE_MD_REVIEW_DIFF", "HEAD~1")
    diff = collect_diff(root, mode).strip()
    if not diff:
        debug("no diff, skip")
        return 0
    if len(diff) > MAX_DIFF_CHARS:
        diff = diff[:MAX_DIFF_CHARS] + "\n... (truncated)"
    debug(f"diff: {len(diff)} chars, mode={mode}")

    # 3. 取改动文件 + 对应 CLAUDE.md
    files = collect_changed_files(root, mode)
    mds = find_claude_mds_for_files(root, files)
    if not mds:
        debug("no related CLAUDE.md, skip")
        return 0
    debug(f"{len(files)} files, {len(mds)} CLAUDE.md")

    # 4. 决定审查文件路径
    review_rel = os.environ.get("CLAUDE_MD_REVIEW_FILE", REVIEW_FILE_DEFAULT)
    review_path = (root / review_rel).resolve()
    if not str(review_path).startswith(str(root.resolve())):
        # 防止越界写
        review_path = (root / ".claude" / "claude-md-review.md").resolve()

    # 5. 调 Claude 或降级
    if not claude_cli_available():
        debug("claude CLI not found, fallback mode")
        write_fallback_review(
            review_path,
            files,
            sorted(mds),
            root,
            cli_status="未找到",
            fix_hint="安装 Claude Code (https://claude.com/claude-code) 后重新运行本 hook 即可获得完整审查。",
        )
        return 0

    prompt = build_prompt(diff, sorted(mds), root)
    cmd = ["claude", "-p", "--output-format", "text"]
    model = os.environ.get("CLAUDE_MD_REVIEW_MODEL")
    if model:
        cmd.extend(["--model", model])
    debug(f"running: {' '.join(cmd)} (prompt={len(prompt)} chars)")

    # 防递归：传 LOCK 给子进程
    env = {**os.environ, LOCK_VAR: "1"}
    try:
        r = run(cmd, input_text=prompt, env=env, cwd=str(root))
        if r.returncode != 0:
            debug(f"claude failed: rc={r.returncode}, stderr={r.stderr[:200]}")
            write_fallback_review(
                review_path,
                files,
                sorted(mds),
                root,
                cli_status=f"执行失败 (rc={r.returncode})",
                fix_hint="检查 claude CLI 是否正常工作，或运行 `claude --help` 验证。",
            )
            return 0
        # 把 Claude 的输出也写一份（方便用户直接看）
        review_path.parent.mkdir(parents=True, exist_ok=True)
        review_path.write_text(r.stdout, encoding="utf-8")
        debug(f"wrote review to {review_path}")
    except Exception as e:  # noqa: BLE001 - 必须吞掉所有异常，不能阻塞主流程
        debug(f"exception: {e}")
        write_fallback_review(
            review_path,
            files,
            sorted(mds),
            root,
            cli_status="异常退出",
            fix_hint=f"检查 hook 日志（设置 CLAUDE_MD_REVIEW_DEBUG=1）：{e}",
        )
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:  # noqa: BLE001
        # 兜底：hook 永远不能让 Claude Code 报错退出
        sys.exit(0)
