#!/usr/bin/env bash
# scripts/check-commands.sh
# 验证每个子目录 CLAUDE.md 里的命令是否实际可执行。
# 仅做 dry-run（which/--help），不真跑。

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
# shellcheck source=_lib.sh
source "$SCRIPT_DIR/_lib.sh"

# 跨平台 find 否定词：GNU=-not, BSD=!
_NEG="!"
[[ "$(_os_name)" == "linux" ]] && _NEG="-not"
REPO="${1:-$(pwd)}"
cd "$REPO" || exit 1

# 从 CLAUDE.md 里提取 ``` 围栏里以包管理器开头的行
PASS=0
FAIL=0
SKIP=0

extract_commands() {
  awk '
    /^```/ {in_block=!in_block; next}
    in_block {print}
  ' "$1" | grep -E "^\s*(npm|pnpm|yarn|bun|go|cargo|pytest|mvn|gradle|make|uv|poetry|turbo|nx|swift|xcodebuild|gradlew)" | head -20
}

check_cmd() {
  local cmd="$1"
  local source="$2"
  # 提取第一个 token
  local first
  first=$(echo "$cmd" | awk '{print $1}')

  if [[ -x "./node_modules/.bin/$first" ]] || command -v "$first" >/dev/null 2>&1; then
    echo "✅ $cmd  (in $source)"
    PASS=$((PASS+1))
  else
    echo "⚠️  $cmd  (未找到 $first)"
    SKIP=$((SKIP+1))
  fi
}

while IFS= read -r f; do
  echo "=== $f ==="
  while IFS= read -r cmd; do
    [[ -z "$cmd" ]] && continue
    check_cmd "$cmd" "$f"
  done < <(extract_commands "$f")
  echo
done < <(find . -name "CLAUDE.md" $_NEG -path './node_modules/*' 2>/dev/null)

echo "总览：通过 $PASS / 跳过(需手动验证) $SKIP / 失败 $FAIL"
exit 0
