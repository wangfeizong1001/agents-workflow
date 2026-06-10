#!/usr/bin/env bash
# scripts/check-line-budget.sh
# 验证 CLAUDE.md 行数预算。
# 根 ≤ 80 行（容忍 120），子目录 20-50 行。

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
# shellcheck source=_lib.sh
source "$SCRIPT_DIR/_lib.sh"

# 跨平台 find 否定词：GNU=-not, BSD=!
_NEG="!"
[[ "$(_os_name)" == "linux" ]] && _NEG="-not"
REPO="${1:-$(pwd)}"
cd "$REPO" || exit 1

PASS=0
FAIL=0
WARN=0

check_file() {
  local f="$1"
  local kind="$2"  # root | subdir
  local max="$3"
  local min="$4"
  local lines
  lines=$(wc -l < "$f")

  if [[ $lines -gt $max ]]; then
    echo "🔴 FAIL  $f: $lines 行 > 预算 $max"
    FAIL=$((FAIL+1))
  elif [[ $lines -lt $min ]]; then
    if [[ $kind == "subdir" && $lines -lt 10 ]]; then
      echo "🟡 WARN  $f: $lines 行 < 10 → 拆过了，合并到上级"
      WARN=$((WARN+1))
    else
      echo "🟡 WARN  $f: $lines 行 < 最小 $min"
      WARN=$((WARN+1))
    fi
  else
    echo "✅ PASS  $f: $lines 行（$min-$max 区间内）"
    PASS=$((PASS+1))
  fi
}

echo "=== CLAUDE.md 行数预算检查 ==="
echo

[[ -f CLAUDE.md ]] && check_file "CLAUDE.md" "root" 80 20 || echo "ℹ️  无根 CLAUDE.md"

while IFS= read -r f; do
  check_file "$f" "subdir" 50 15
done < <(find . -name "CLAUDE.md" -mindepth 2 $_NEG -path './node_modules/*' 2>/dev/null)

echo
echo "通过: $PASS  警告: $WARN  失败: $FAIL"
[[ $FAIL -gt 0 ]] && exit 1
exit 0
