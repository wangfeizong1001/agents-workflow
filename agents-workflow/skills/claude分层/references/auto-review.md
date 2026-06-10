# CLAUDE.md 自动审查（Stop Hook）详解

## 原理

```
Claude Code 会话结束
    ↓ (触发 Stop 事件)
.claude/hooks/propose_claude_md.py
    ↓
读 git diff + 相关 CLAUDE.md
    ↓
拼装审查 Prompt
    ↓
启动无头 Claude 会话（带 LOCK 防递归）
    ↓
写入 .claude/claude-md-review.md
```

**不直接改 CLAUDE.md**。建议写审查文件，人工审过后手动应用。

## 装/卸

```bash
# 装
bash <skill-dir>/scripts/install-hook.sh --target <repo-root>

# 卸
bash <skill-dir>/scripts/install-hook.sh --target <repo-root> --uninstall
```

## 三道安全阀

### 1. 防递归

```bash
# 子进程会设这个环境变量
CLAUDE_MD_REVIEW_LOCK=1
```

脚本入口检查到 LOCK 就直接 `sys.exit(0)`。否则审查者会不停召唤审查者。

### 2. 优雅降级

| 情况 | 行为 |
|---|---|
| `claude` CLI 找不到 | 写 fallback 文件，列出改动区域 |
| `claude` 执行失败（rc≠0） | 同上，提示 "执行失败 (rc=N)" |
| 不在 git 仓库 | 静默退出 |
| 没有相关 CLAUDE.md | 静默退出 |
| 没 diff | 静默退出 |
| 任何异常 | 兜底写 fallback + 静默退出 |

**绝对不抛异常**。hook 失败也不能阻塞主 Claude 会话。

### 3. 不自动改源

输出目标固定是 `.claude/claude-md-review.md`。Prompt 里硬约束：

```
Do NOT modify any file yourself. Write your review to <file> only.
```

理由：自动改规则文件太危险，写坏一次影响后续所有会话。

## Prompt 设计

完整的 Prompt 见 `propose_claude_md.py` 的 `REVIEW_PROMPT_TEMPLATE`。

**三个核心约束**：

1. **给"不用改"一个名分** — 明确要求 "No change needed" / "Propose edit" 二选一输出
2. **禁止风格改写** — "Do NOT suggest stylistic rewrites, grammar fixes, or reorganization"
3. **只写审查文件** — "Do NOT modify any file yourself"

**三个常见检测信号**：

- 路径/函数/命令在 diff 中被重命名
- 新增约定没人写进 CLAUDE.md
- 旧约定（diff 中被删除的）还留在 CLAUDE.md 里误导

## 调优

### 用小模型省 token

```json
{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "CLAUDE_MD_REVIEW_MODEL=haiku python .claude/hooks/propose_claude_md.py"
      }]
    }]
  }
}
```

`haiku` 审查质量够用，每次大约 2-5K token。`sonnet` 更准但贵 3-5 倍。

### 改 diff 范围

```bash
# 默认
git diff HEAD~1 -- :/*

# 想要 staged + unstaged 一起看
CLAUDE_MD_REVIEW_DIFF=staged+unstaged python .claude/hooks/propose_claude_md.py
```

### 调试

```bash
CLAUDE_MD_REVIEW_DEBUG=1 python .claude/hooks/propose_claude_md.py
```

会打印到 stderr：

```
[claude-md-review] repo root: /path/to/repo
[claude-md-review] diff: 11485 chars, mode=HEAD~1
[claude-md-review] 5 files, 1 CLAUDE.md
[claude-md-review] running: claude -p ... (prompt=12758 chars)
[claude-md-review] wrote review to /path/.claude/claude-md-review.md
```

### 紧急停用

```bash
CLAUDE_MD_REVIEW_SKIP=1 python .claude/hooks/propose_claude_md.py
```

或在 `settings.json` 的 command 前加：

```json
"command": "CLAUDE_MD_REVIEW_SKIP=1 python .claude/hooks/propose_claude_md.py"
```

## 审查文件示例

```markdown
# CLAUDE.md Review 2026-05-24 14:08

## packages/billing/CLAUDE.md
No change needed. 约定 "all amounts in cents, never floats" 在 diff 中依然成立。

## packages/shared/CLAUDE.md
Propose edit. 第 12-14 行写的是 "use loadEnv() from config/env.ts"，diff 里这个
函数已重命名为 getEnv() 且移到 config/runtime.ts。更新路径和函数名。
理由：旧引用会误导后续会话。
```

## 跟设计模式配合

| 阶段 | 操作 |
|---|---|
| 项目初期 | 跑 `detect-project.sh` + `render-template.sh` 设计第一套 CLAUDE.md |
| 稳定运行 | 装 Stop Hook 开始自动审查 |
| 审查文件指出问题 | 手动应用建议，或再跑 `render-template.sh` 局部重构 |
| 项目结构大改 | 卸载 hook，重新设计 + 装 hook |

## 适合/不适合场景

### ✅ 适合

- 多子目录 monorepo（人手检查不现实）
- 团队共用项目
- 频繁迭代（每周新约定）
- 项目过了早期原型阶段

### ❌ 不适合

- 一个人维护稳定小项目
- 根目录就一个短 CLAUDE.md
- 改动频率月级别

对不适合的场景，每几个月手动 review 一次即可，hook 带来的额外 token 消耗不划算。

## 跨平台说明

- **Python 3.8+** 跨平台 ✅
- **git** 跨平台 ✅
- **claude CLI** 跨平台 ✅
- 路径用 `os.path.join` / `os.sep`，不依赖 `/` ✅
- 进程环境变量 `os.environ` 跨平台 ✅
- `subprocess.run` 用 `text=True, encoding="utf-8"`，Windows 也安全 ✅

详见 `cross-platform.md`。

## 进阶：换 Prompt 审查其他东西

骨架不挑内容。换 Prompt 同样 hook 可以审查：

| 审查目标 | Prompt 方向 |
|---|---|
| Skills 描述过时 | 对照 diff 检查 skill 描述是否仍覆盖当前代码范围 |
| 权限范围过大 | 看 settings.json 的 allow 列表，有没有可以收窄的 |
| Start Hook 上下文 | 把 git status、最近 commit 注入启动上下文 |
| README 链接失效 | 检查 markdown 链接指向的路径是否还存在 |
| ADR 决策仍成立 | 对照 diff 检查 ADR 的"决策依据"是否还成立 |

**元规则**：任何跟代码同存的规则文件，都该有个东西同时读两者，看是否偏离。

## 故障排查

| 症状 | 排查 |
|---|---|
| 审查文件没生成 | `CLAUDE_MD_REVIEW_DEBUG=1` 跑一次看 stderr |
| 审查文件总是 fallback | `which claude` 看是否安装；`claude --help` 看是否正常 |
| 每次启动两次 Claude | LOCK 没生效，看 hook 命令里是否 export 了 LOCK |
| 越跑越慢 | 改用 `haiku` 模型；diff 太大就 truncate（已内置 12K 上限） |
| 审查建议总是不准 | 换 `sonnet` 模型；或调 Prompt 的"硬约束"段落 |

## 提交到 git

`.claude/hooks/propose_claude_md.py` 和 `.claude/settings.json` **应该**提交到 git。
`.claude/claude-md-review.md` 不提交（`install-hook.sh` 会自动加 `.gitignore`）。
