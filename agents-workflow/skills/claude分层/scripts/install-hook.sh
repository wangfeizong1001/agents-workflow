#!/usr/bin/env bash
# scripts/install-hook.sh
# 一键安装 CLAUDE.md 自动审查 Stop Hook。
# 用法：install-hook.sh [--uninstall] [--target <repo-root>]

set -u
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
# shellcheck source=_lib.sh
source "$SCRIPT_DIR/_lib.sh"

REPO=""
UNINSTALL=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --uninstall) UNINSTALL=1; shift ;;
    --target) REPO="$2"; shift 2 ;;
    -h|--help)
      cat <<EOF
用法：install-hook.sh [选项]

选项：
  --target <dir>   目标仓库根（默认：当前目录）
  --uninstall      移除 hook
  -h, --help       显示帮助

安装内容：
  .claude/hooks/propose_claude_md.py   Stop Hook 脚本
  .claude/settings.json               钩子注册（合并到现有文件）
EOF
      exit 0 ;;
    *) echo "未知参数: $1" >&2; exit 1 ;;
  esac
done

REPO="${REPO:-$(pwd)}"
cd "$REPO" || exit 1

# 必须 git 仓库
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "错误：$REPO 不是 git 仓库" >&2
  exit 1
fi

HOOK_DIR=".claude/hooks"
SETTINGS_FILE=".claude/settings.json"
HOOK_SCRIPT="$HOOK_DIR/propose_claude_md.py"
HOOK_REL="python $HOOK_SCRIPT"

# 卸载模式
if [[ $UNINSTALL -eq 1 ]]; then
  echo "卸载 CLAUDE.md 自动审查 hook..."
  [[ -f "$HOOK_SCRIPT" ]] && rm -v "$HOOK_SCRIPT" && echo "  删除 $HOOK_SCRIPT"
  if [[ -f "$SETTINGS_FILE" ]]; then
    if _have python3 || _have python || _have node || _have jq; then
      # 从 settings.json 移除 propose_claude_md 相关的 hook
      tmp=$(mktemp)
      _have python3 && \
        python3 -c "
import json, sys
p = '$SETTINGS_FILE'
try:
    s = json.load(open(p))
except Exception:
    sys.exit(0)
hooks = s.get('hooks', {})
stop = hooks.get('Stop', [])
new_stop = []
for entry in stop:
    sub = entry.get('hooks', [])
    sub = [h for h in sub if 'propose_claude_md' not in h.get('command','')]
    if sub:
        entry['hooks'] = sub
        new_stop.append(entry)
if new_stop:
    hooks['Stop'] = new_stop
    s['hooks'] = hooks
else:
    s.pop('hooks', None)
json.dump(s, open(p,'w'), indent=2, ensure_ascii=False)
" && echo "  更新 $SETTINGS_FILE（移除 Stop hook）"
      rm -f "$tmp"
    fi
  fi
  # 询问是否删审查文件
  if [[ -f ".claude/claude-md-review.md" ]]; then
    read -p "删除 .claude/claude-md-review.md？(y/N) " yn
    [[ "$yn" =~ ^[Yy]$ ]] && rm -v .claude/claude-md-review.md
  fi
  echo "✅ 卸载完成"
  exit 0
fi

# 安装模式
echo "安装 CLAUDE.md 自动审查 hook 到 $REPO ..."
echo

# 1. 复制 hook 脚本
mkdir -p "$HOOK_DIR"
if [[ -f "$SCRIPT_DIR/propose_claude_md.py" ]]; then
  cp "$SCRIPT_DIR/propose_claude_md.py" "$HOOK_SCRIPT"
  chmod +x "$HOOK_SCRIPT"
  echo "  ✅ $HOOK_SCRIPT"
else
  echo "  🔴 找不到源脚本 $SCRIPT_DIR/propose_claude_md.py" >&2
  exit 1
fi

# 2. 合并到 .claude/settings.json
mkdir -p .claude
if [[ ! -f "$SETTINGS_FILE" ]]; then
  # 新建
  if _have python3 || _have python || _have node || _have jq; then
    if _have python3; then
      python3 -c "
import json
s = {'hooks': {'Stop': [{'hooks': [{'type': 'command', 'command': '$HOOK_REL'}]}]}}
json.dump(s, open('$SETTINGS_FILE','w'), indent=2, ensure_ascii=False)
"
    fi
    echo "  ✅ 新建 $SETTINGS_FILE"
  else
    # 兜底：手写
    cat > "$SETTINGS_FILE" <<EOF
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$HOOK_REL"
          }
        ]
      }
    ]
  }
}
EOF
    echo "  ✅ 新建 $SETTINGS_FILE（纯文本）"
  fi
else
  # 已存在 → 合并
  if _have python3 || _have python || _have node || _have jq; then
    _have python3 && \
      python3 -c "
import json
p = '$SETTINGS_FILE'
try:
    s = json.load(open(p))
except Exception:
    s = {}
hooks = s.setdefault('hooks', {})
stop = hooks.setdefault('Stop', [])
# 查重
already = False
for entry in stop:
    for h in entry.get('hooks', []):
        if 'propose_claude_md' in h.get('command',''):
            already = True
            break
if not already:
    stop.append({'hooks': [{'type': 'command', 'command': '$HOOK_REL'}]})
json.dump(s, open(p,'w'), indent=2, ensure_ascii=False)
print('  已合并到现有 $SETTINGS_FILE' if already else '  ✅ 已添加到现有 $SETTINGS_FILE')
"
  else
    echo "  ⚠️  已存在 $SETTINGS_FILE 但缺 JSON 解析器，请手动添加：" >&2
    cat >&2 <<EOF
    "hooks": {
      "Stop": [
        {
          "hooks": [
            { "type": "command", "command": "$HOOK_REL" }
          ]
        }
      ]
    }
EOF
  fi
fi

# 3. 加入 .gitignore（审查文件不进 git）
GITIGNORE=".gitignore"
[[ ! -f "$GITIGNORE" ]] && touch "$GITIGNORE"
if ! grep -q "claude-md-review.md" "$GITIGNORE"; then
  echo "" >> "$GITIGNORE"
  echo "# CLAUDE.md 自动审查输出" >> "$GITIGNORE"
  echo ".claude/claude-md-review.md" >> "$GITIGNORE"
  echo "  ✅ 已加 .gitignore 排除"
fi

echo
echo "=== 安装完成 ==="
echo
echo "工作原理："
echo "  每次 Claude Code 会话结束 → 自动跑 hook → 用 git diff 对照 CLAUDE.md"
echo "  → Claude 审查并把建议写到 .claude/claude-md-review.md"
echo
echo "可调环境变量（在 .claude/settings.json 的 command 里 export）："
echo "  CLAUDE_MD_REVIEW_MODEL   调用的模型（默认沿用 CLI，建议 haiku 省 token）"
echo "  CLAUDE_MD_REVIEW_DIFF    diff 模式：HEAD~1（默认）/ staged+unstaged"
echo "  CLAUDE_MD_REVIEW_SKIP    1=跳过本轮"
echo "  CLAUDE_MD_REVIEW_DEBUG   1=打印详细日志"
echo
echo "卸载：$0 --uninstall"
