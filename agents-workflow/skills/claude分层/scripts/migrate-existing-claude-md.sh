#!/usr/bin/env bash
# scripts/migrate-existing-claude-md.sh
# 把已有的根 CLAUDE.md 按"条件句"和"包专属"段落拆到子目录。
# 流程：
#   1. 备份 CLAUDE.md → CLAUDE.md.bak
#   2. 扫描"如果你在 X 目录工作"等条件句
#   3. 提取命令段落（识别包管理器前缀）
#   4. 输出建议拆分方案（不直接写文件，等用户确认）

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
# shellcheck source=_lib.sh
source "$SCRIPT_DIR/_lib.sh"

# 跨平台 find 否定词：GNU=-not, BSD=!
_NEG="!"
[[ "$(_os_name)" == "linux" ]] && _NEG="-not"
REPO="${1:-$(pwd)}"
cd "$REPO" || exit 1

if [[ ! -f CLAUDE.md ]]; then
  echo "无根 CLAUDE.md，无需迁移" >&2
  exit 0
fi

cp CLAUDE.md CLAUDE.md.bak
echo "已备份：CLAUDE.md.bak"
echo

echo "=== 检测到的条件句（应拆到子目录）==="
grep -nE "如果你在.*目录" CLAUDE.md 2>/dev/null | sed 's/^/  /' || echo "  无"
echo

echo "=== 检测到的包专属命令（应拆到子目录）==="
awk '
  /^## / {section=$0; in_cmd=0}
  /命令|Commands|Run|测试/ {in_cmd=1}
  in_cmd && /^(npm|pnpm|yarn|go|cargo|pytest|mvn|gradle|make|uv|poetry|turbo|nx)/ {
    print "  [" section "] " $0
  }
' CLAUDE.md
echo

echo "=== H2 章节概览 ==="
grep -E "^## " CLAUDE.md | sed 's/^/  /'
echo

echo "=== 行数 ==="
wc -l CLAUDE.md | sed 's/^/  /'
echo

echo "迁移建议："
LINES=$(wc -l < CLAUDE.md)
if [[ $LINES -gt 120 ]]; then
  echo "  1. 拆分出 3-5 个子目录 CLAUDE.md"
  echo "  2. 根文件目标：50-80 行"
  echo "  3. 启用 .claude/rules/ 做路径谓词"
elif [[ $LINES -gt 80 ]]; then
  echo "  1. 拆分出 1-3 个子目录 CLAUDE.md"
  echo "  2. 根文件目标：50-80 行"
else
  echo "  1. 可选：拆出 1 个子目录（如果存在条件句）"
  echo "  2. 根文件继续使用"
fi
echo
echo "下一步：用编辑器打开 CLAUDE.md.bak 对照，按 references/migration.md 指南操作"
