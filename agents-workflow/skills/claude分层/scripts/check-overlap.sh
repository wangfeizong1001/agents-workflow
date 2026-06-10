#!/usr/bin/env bash
# scripts/check-overlap.sh
# 检查根与子目录 CLAUDE.md 是否内容重叠。
# 策略：提取每个文件的"约定"段落，做 n-gram 集合对比。

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
# shellcheck source=_lib.sh
source "$SCRIPT_DIR/_lib.sh"

# 跨平台 find 否定词：GNU=-not, BSD=!
_NEG="!"
[[ "$(_os_name)" == "linux" ]] && _NEG="-not"
REPO="${1:-$(pwd)}"
cd "$REPO" || exit 1

TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

extract_section() {
  local f="$1"
  local header="$2"
  awk -v h="$header" '
    $0 ~ "^## " h {p=1; next}
    /^## / {p=0}
    p {print}
  ' "$f"
}

OVERLAP_FOUND=0

# 对每个子目录 CLAUDE.md，检查与根的"## 约定"段是否重叠
while IFS= read -r sub; do
  [[ ! -f "$sub" ]] && continue
  [[ ! -f CLAUDE.md ]] && continue

  # 提取"约定"段（5+ 字的句子）
  root_conventions=$(extract_section CLAUDE.md "约定" | tr -cs 'A-Za-z\u4e00-\u9fff' '\n' | awk 'length>=5' | sort -u)
  sub_conventions=$(extract_section "$sub" "约定" | tr -cs 'A-Za-z\u4e00-\u9fff' '\n' | awk 'length>=5' | sort -u)

  if [[ -z "$root_conventions" || -z "$sub_conventions" ]]; then
    continue
  fi

  # 找交集
  overlap=$(comm -12 <(echo "$root_conventions") <(echo "$sub_conventions") 2>/dev/null | head -5)
  if [[ -n "$overlap" ]]; then
    echo "🔴 重叠  根 vs $sub"
    echo "$overlap" | sed 's/^/    /'
    OVERLAP_FOUND=1
  fi
done < <(find . -name "CLAUDE.md" -mindepth 2 $_NEG -path './node_modules/*' 2>/dev/null)

if [[ $OVERLAP_FOUND -eq 0 ]]; then
  echo "✅ 无重叠"
  exit 0
fi

echo
echo "修复建议：把重叠内容只保留在更深一级的子目录，或在根文件用'参见 X'链接代替"
exit 1
