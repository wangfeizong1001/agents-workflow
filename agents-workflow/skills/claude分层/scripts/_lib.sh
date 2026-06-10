#!/usr/bin/env bash
# scripts/_lib.sh
# 跨平台兼容层：macOS (BSD userland) / Linux (GNU) / WSL / Git Bash (msys)
# 用法：在其他脚本里 source 此文件，然后调用 _xxx 函数。

# 严格模式（不在这开启，调用方自己开）
set +e

# ---- 平台检测 ---------------------------------------------------------
_os_name() {
  case "$(uname -s 2>/dev/null)" in
    Linux*)   echo "linux" ;;
    Darwin*)  echo "darwin" ;;
    MINGW*|MSYS*|CYGWIN*) echo "windows-bash" ;;
    *)        echo "unknown" ;;
  esac
}

# ---- realpath 替代（macOS 没装 coreutils 时）-------------------------
# 用法：_realpath <path>
_realpath() {
  local p="${1:-}"
  if [[ -z "$p" ]]; then
    pwd -P
    return
  fi
  if command -v realpath >/dev/null 2>&1; then
    realpath "$p" 2>/dev/null && return
  fi
  # readlink -f 在 GNU 和 macOS 都支持
  if readlink -f "$p" >/dev/null 2>&1; then
    readlink -f "$p"
    return
  fi
  # 兜底：cd + pwd
  (cd "$(dirname -- "$p")" 2>/dev/null && printf '%s/%s\n' "$(pwd -P)" "$(basename -- "$p")")
}

# ---- 跨平台 find 否定（GNU: -not  BSD: !）----------------------------
# 用法：_find <path> [other args] _neg_ <pattern> [other args]
# 实际使用建议直接用 _find_neg_path
_find_neg_path() {
  local start="$1"; shift
  local pat="$1"; shift
  case "$(_os_name)" in
    darwin|freebsd) find "$start" ! -path "$pat" "$@" ;;
    *)              find "$start" -not -path "$pat" "$@" ;;
  esac
}

# ---- JSON 值提取（按 KEY 读取顶层字段）--------------------------------
# 用法：_json_get <vars.json> <KEY>
# 优先级：node > python3 > python > jq
_json_get() {
  local file="$1" key="$2"
  if command -v node >/dev/null 2>&1; then
    node -e "
      try {
        const v = require(process.argv[1]);
        const val = v[process.argv[2]];
        if (val === undefined || val === null) process.exit(0);
        if (typeof val === 'object') process.stdout.write(JSON.stringify(val));
        else process.stdout.write(String(val));
      } catch (e) { process.exit(0); }
    " "$file" "$key" 2>/dev/null
    return
  fi
  if command -v python3 >/dev/null 2>&1; then
    python3 -c "
import json, sys
try:
    v = json.load(open('$file'))
    val = v.get('$key')
    if val is None: sys.exit(0)
    if isinstance(val, (dict, list)): print(json.dumps(val, ensure_ascii=False), end='')
    else: print(str(val), end='')
except Exception: sys.exit(0)
" 2>/dev/null
    return
  fi
  if command -v python >/dev/null 2>&1; then
    python -c "
import json, sys
try:
    v = json.load(open('$file'))
    val = v.get('$key')
    if val is None: sys.exit(0)
    if isinstance(val, (dict, list)): print(json.dumps(val, ensure_ascii=False), end='')
    else: print(str(val), end='')
except Exception: sys.exit(0)
" 2>/dev/null
    return
  fi
  if command -v jq >/dev/null 2>&1; then
    jq -r --arg k "$key" '.[$k] // empty' "$file" 2>/dev/null
    return
  fi
  # 全部缺失：全局只报错一次（用文件持久化，跨子 shell 生效）
  local guard_file="/tmp/.claude-md-json-guard-$$"
  if [[ ! -f "$guard_file" ]]; then
    echo "[error] no JSON parser found (need one of: node, python3, python, jq)" >&2
    echo "        装一个：brew install node / apt install nodejs / scoop install nodejs-lts" >&2
    touch "$guard_file"
  fi
  return 1
}

# ---- 模板渲染（perl 优先，awk 降级）-----------------------------------
# 用法：_render_template <content_string>
# 占位符：{{KEY}}，KEY 在 PERL_VARS/PERL_KEYS 环境变量中以 perl 赋值语句给出
# 输出：渲染后内容
_render_template() {
  local content="$1"
  local perl_vars="$2"
  local perl_expr="$3"

  if command -v perl >/dev/null 2>&1; then
    printf '%s' "$content" | perl -e "$perl_vars $perl_expr"
    return $?
  fi

  # 降级：awk 不支持多行 pattern 替换，但能做基础替换
  # 此降级仅支持无特殊字符的简单占位符
  echo "[warn] perl not found, falling back to awk (limited: no multi-line / no special chars in values)" >&2
  local out="$content"
  for PH in $PERL_KEYS_FALLBACK; do
    local val="${!PH}"
    # awk gsub 替换
    out=$(printf '%s' "$out" | awk -v ph="{{$PH}}" -v v="$val" '{ gsub(ph, v); print }')
  done
  printf '%s' "$out"
}

# ---- 工具可用性检查 ---------------------------------------------------
# 用法：_have <tool>
_have() { command -v "$1" >/dev/null 2>&1; }

# ---- 报告工具是否存在（带描述）---------------------------------------
_tool_status() {
  local tool="$1" desc="$2" has_fallback="$3"
  if _have "$tool"; then
    echo "  ✅ $tool  $desc"
  else
    if [[ "$has_fallback" == "1" ]]; then
      echo "  🟡 $tool  缺失（有降级方案）  $desc"
    else
      echo "  🔴 $tool  缺失（无降级）  $desc"
    fi
  fi
}

# ---- 输出当前环境摘要（被 os-detect.sh 复用）-------------------------
# 用法：_os_report [stderr]
_os_report() {
  cat <<EOF
=== 平台检测 ===
uname -s:        $(uname -s 2>/dev/null || echo unknown)
平台:            $(_os_name)
bash:            ${BASH_VERSION:-none}
shell:           $0
PWD:             $(pwd)

=== 关键工具 ===
realpath:        $(_have realpath && echo "yes" || echo "no（用 readlink -f/pwd 兜底）")
perl:            $(_have perl && echo "yes" || echo "no（awk 降级）")
node:            $(if _have node; then node -v 2>&1; else echo no; fi)
python3:         $(_have python3 && echo "yes" || echo no)
python:          $(_have python && echo "yes" || echo no)
jq:              $(_have jq && echo "yes" || echo no)
git:             $(if _have git; then git --version 2>&1 | head -1; else echo no; fi)
find:            $(find --version 2>/dev/null | head -1 || echo "BSD find (macOS)")

=== 兼容性结论 ===
EOF

  local issues=0
  case "$(_os_name)" in
    darwin)
      echo "macOS 平台：realpath/find -not/perl 已自动降级"
      if ! _have node && ! _have python3 && ! _have python; then
        echo "  🔴 缺 JSON 解析器：装 node (brew install node) 或 python3 (brew install python)"
        issues=$((issues+1))
      fi
      if ! _have perl; then
        echo "  🟡 perl 缺失：渲染将降级到 awk（不支持多行值）"
        echo "     修复：brew install perl 或装 Xcode Command Line Tools"
        issues=$((issues+1))
      fi
      ;;
    windows-bash)
      echo "Windows Bash 环境（Git Bash / MSYS / WSL bash）"
      echo "  路径转换在脚本内已做，命令本身需 git/perl/node 之一"
      if ! _have perl; then
        echo "  🟡 perl 缺失：装 Strawberry Perl 或 scoop install perl"
        issues=$((issues+1))
      fi
      if ! _have node && ! _have python3; then
        echo "  🟡 JSON 解析器缺失：装 node 或 python3"
        issues=$((issues+1))
      fi
      ;;
    linux)
      echo "Linux 平台：完全支持"
      ;;
    *)
      echo "未知平台：尽力兼容，建议 Linux/macOS/WSL"
      issues=$((issues+1))
      ;;
  esac

  if [[ $issues -eq 0 ]]; then
    echo "✅ 所有必需工具可用"
  else
    echo "⚠️  $issues 项可选工具缺失（脚本可降级运行）"
  fi
}
