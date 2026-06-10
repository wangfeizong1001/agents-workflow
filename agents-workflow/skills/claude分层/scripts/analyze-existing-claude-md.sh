#!/usr/bin/env bash
# scripts/analyze-existing-claude-md.sh
# 盘点仓库中已存在的 CLAUDE.md / AGENTS.md，给出拆分建议。
# 用法：analyze-existing-claude-md.sh <repo-root>
# 跨平台：依赖 _lib.sh

set -u
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
# shellcheck source=_lib.sh
source "$SCRIPT_DIR/_lib.sh"

REPO="${1:-$(pwd)}"
cd "$REPO" || exit 1

# 跨平台 find 否定词：GNU=-not, BSD=!
_NEG="!"
[[ "$(_os_name)" == "linux" ]] && _NEG="-not"

echo "=== 现有 CLAUDE.md 盘点 ==="
echo

TOTAL_ROOT_LINES=0
HAS_CONDITIONALS=0
TOPICS=()

# 1. 根文件
if [[ -f CLAUDE.md ]]; then
  LINES=$(wc -l < CLAUDE.md)
  TOTAL_ROOT_LINES=$LINES
  echo "根: CLAUDE.md ($LINES 行)"

  # 检测条件句
  if grep -qE "如果你在.*目录" CLAUDE.md 2>/dev/null; then
    HAS_CONDITIONALS=1
    echo "  ⚠️  检测到'如果你在 X 目录'条件句 → 应拆分"
  fi

  # 提取 H2 标题
  echo "  章节:"
  grep -E "^## " CLAUDE.md | sed 's/^/    /'
  echo

  # 提取代码围栏中的命令
  echo "  检测到的命令:"
  grep -E "^\s*(- |\* )?(npm|pnpm|yarn|bun|go|cargo|pytest|mvn|gradle|make)" CLAUDE.md 2>/dev/null | head -10 | sed 's/^/    /'
  echo
else
  echo "根: 无 CLAUDE.md"
  echo
fi

# 2. 子目录 CLAUDE.md
echo "=== 子目录 CLAUDE.md ==="
find . -name "CLAUDE.md" $_NEG -path './node_modules/*' $_NEG -path './.git/*' -mindepth 2 2>/dev/null | while read -r f; do
  LINES=$(wc -l < "$f")
  echo "$(_realpath "$f"): $LINES 行"
done
echo

# 3. AGENTS.md（OpenCode/Codex 风格）
echo "=== AGENTS.md (OpenCode/Codex 风格) ==="
EXISTING_AGENTS=$(find . -name "AGENTS.md" $_NEG -path './node_modules/*' 2>/dev/null | wc -l)
if [[ $EXISTING_AGENTS -gt 0 ]]; then
  echo "  检测到 $EXISTING_AGENTS 个 AGENTS.md"
  echo "  → 本 skill 会用 AGENTS.md 作为主文件，CLAUDE.md 作别名"
  find . -name "AGENTS.md" $_NEG -path './node_modules/*' 2>/dev/null | head -20 | sed 's/^/    /'
else
  echo "  无"
fi
echo

# 4. .claude/rules/
echo "=== .claude/rules/ (路径谓词) ==="
if [[ -d .claude/rules ]]; then
  echo "  已存在："
  find .claude/rules -type f 2>/dev/null | sed 's/^/    /'
else
  echo "  无（可选用）"
fi
echo

# 5. .claude/skills/ 或 .agents/skills/（本地 skill）
echo "=== 本地 skills ==="
for d in .claude/skills .agents/skills; do
  if [[ -d "$d" ]]; then
    echo "  $d:"
    find "$d" -name "SKILL.md" 2>/dev/null | sed 's/^/    /'
  fi
done
echo

# 6. 行数预算评估
echo "=== 行数预算评估 ==="
if [[ $TOTAL_ROOT_LINES -gt 120 ]]; then
  echo "  🔴 根文件 > 120 行 → 强制拆分"
elif [[ $TOTAL_ROOT_LINES -gt 80 ]]; then
  echo "  🟡 根文件 80-120 行 → 强烈建议拆分"
elif [[ $TOTAL_ROOT_LINES -gt 50 ]]; then
  echo "  🟢 根文件 50-80 行 → 可选拆分"
else
  echo "  ✅ 根文件 ≤ 50 行 → 暂不拆"
fi
echo

# 7. 拆分建议（粗略）
echo "=== 拆分建议 ==="
case "$TOTAL_ROOT_LINES" in
  0)
    echo "  - 从零生成"
    ;;
  [1-9]|[1-4][0-9])
    echo "  - 暂不拆，根文件继续使用"
    ;;
  [5-7][0-9])
    if [[ $HAS_CONDITIONALS -eq 1 ]]; then
      echo "  - 条件句少 → 抽出 1-2 个子目录文件"
    else
      echo "  - 无条件句 → 继续观察"
    fi
    ;;
  [8-9][0-9]|1[0-1][0-9]|1[2-9][0-9])
    echo "  - 必须拆：识别出 2-4 个子目录"
    ;;
  *)
    echo "  - 严重超长：拆 4+ 个子目录，并启用 .claude/rules/"
    ;;
esac
