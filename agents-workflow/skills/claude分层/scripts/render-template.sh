#!/usr/bin/env bash
# scripts/render-template.sh
# 用 envsubst 风格的占位符替换渲染模板。
# 用法：render-template.sh <tmpl> <vars.json> <output>
# 占位符：{{KEY}}，KEY 在 vars.json 中为顶层字段
# 跨平台：macOS / Linux / WSL / Git Bash

set -u
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
# shellcheck source=_lib.sh
source "$SCRIPT_DIR/_lib.sh"

TEMPLATE="${1:?need template path}"
VARS_JSON="${2:?need vars json path}"
OUTPUT="${3:?need output path}"

if [[ ! -f "$TEMPLATE" ]]; then
  echo "template not found: $TEMPLATE" >&2
  exit 1
fi
if [[ ! -f "$VARS_JSON" ]]; then
  echo "vars json not found: $VARS_JSON" >&2
  exit 1
fi

# JSON 值提取（_lib.sh 跨平台版本：node > python3 > python > jq > sed）
get_value() { _json_get "$VARS_JSON" "$1"; }

# 用 perl 做替换（原生支持多行、元字符安全）
CONTENT=$(cat "$TEMPLATE")

# 找出所有 {{KEY}} 占位符（只保留 KEY 部分）
PLACEHOLDERS=$(grep -oE '\{\{[A-Z_][A-Z0-9_]*\}\}' "$TEMPLATE" | sort -u | sed -E 's/^\{\{//; s/\}\}$//')

# 准备 perl 端可见的 %vars
PERL_VARS=""
for PH in $PLACEHOLDERS; do
  VAL=$(get_value "$PH")
  # perl 单引号字面量里 \ 和 ' 需要转义
  VAL_ESC=$(printf '%s' "$VAL" | sed -e "s/\\\\/\\\\\\\\/g" -e "s/'/\\\\'/g")
  PERL_VARS+="\$vars{qq{$PH}} = '$VAL_ESC';"
done

# 构造替换逻辑：模式侧用 \Q{{$ph}}\E，替换侧用 $vars{qq{$ph}}
PERL_EXPR='my $c = do { local $/; <STDIN> };'
for PH in $PLACEHOLDERS; do
  PERL_EXPR+="\$c =~ s/\Q{{$PH}}\E/\$vars{qq{$PH}}/g;"
done
PERL_EXPR+='print $c;'

# 跨平台渲染：perl 优先，awk 降级
_TMPOUT="/tmp/.render-out-$$"
if _have perl; then
  printf '%s' "$CONTENT" | perl -e "$PERL_VARS $PERL_EXPR" > "$_TMPOUT" || {
    echo "perl render failed" >&2
    rm -f "$_TMPOUT"
    exit 1
  }
elif _have awk; then
  # awk 降级：单行替换，不支持多行值
  # awk gsub 的 & 在替换串中始终是元字符（匹配整段），单次转义无效
  # 用占位符 \x01 中转：先全替换成 \x01，再全部换回
  echo "[warn] perl not found, falling back to awk (limited: no multi-line values)" >&2
  awk_result="$CONTENT"
  for PH in $PLACEHOLDERS; do
    VAL=$(get_value "$PH")
    # 把 & 替换为 \x01（gsub 不会把 \x01 当元字符）
    VAL_SAFE=$(printf '%s' "$VAL" | awk 'BEGIN{ORS=""} { gsub(/\\/, "\\\\"); gsub(/&/, "\x01"); print }')
    awk_result=$(printf '%s' "$awk_result" | awk -v p="{{$PH}}" -v v="$VAL_SAFE" '{ gsub(p, v); print }')
  done
  # 把 \x01 换回 &
  awk_result=$(printf '%s' "$awk_result" | awk '{ gsub(/\x01/, "\\&"); print }' 2>/dev/null || printf '%s' "$awk_result" | sed 's/\x01/\&/g')
  printf '%s' "$awk_result" > "$_TMPOUT"
else
  echo "neither perl nor awk found" >&2
  exit 1
fi

CONTENT=$(cat "$_TMPOUT")
rm -f "$_TMPOUT"

# 写出
printf '%s' "$CONTENT" > "$OUTPUT"

# 备份 vars（用 _realpath 跨平台）
mkdir -p "$(dirname "$OUTPUT")/.claude-md-gen"
cp "$VARS_JSON" "$(dirname "$OUTPUT")/.claude-md-gen/$(basename "$OUTPUT").vars.json"

echo "rendered: $OUTPUT ($(wc -l < "$OUTPUT") 行)" >&2
