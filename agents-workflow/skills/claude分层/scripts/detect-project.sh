#!/usr/bin/env bash
# scripts/detect-project.sh
# 探测项目类型、monorepo 工具、包结构。
# 用法：detect-project.sh <repo-root>
# 输出：JSON 格式到 stdout，同时 human-readable 到 stderr
# 跨平台：macOS / Linux / WSL / Git Bash（依赖 _lib.sh）

set -u
# 注意：不加 set -o pipefail，因为 BSD sh 不识别（实际 bash 都有，但保守）

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
# shellcheck source=_lib.sh
source "$SCRIPT_DIR/_lib.sh"

REPO="${1:-$(pwd)}"

if [[ ! -d "$REPO" ]]; then
  echo "{\"error\":\"repo path not found: $REPO\"}" >&2
  exit 1
fi

cd "$REPO" || exit 1

emit() { printf '%s' "$1"; }

# 初始化 JSON
JSON="{"
JSON+=" \"repo_root\": \"$(_realpath "$REPO")\""

# 1. git 仓库？
if [[ -d .git ]] || git rev-parse --git-dir >/dev/null 2>&1; then
  JSON+=", \"git\": true"
  JSON+=", \"branch\": \"$(git branch --show-current 2>/dev/null || echo unknown)\""
else
  JSON+=", \"git\": false"
fi

# 2. 文件总数
FILE_COUNT=$(find . -type f -not -path './.git/*' -not -path './node_modules/*' -not -path './.next/*' -not -path './dist/*' -not -path './build/*' -not -path './target/*' 2>/dev/null | wc -l | tr -d ' ')
JSON+=", \"file_count\": $FILE_COUNT"

# 3. 顶层 manifest 探测（按优先级）
MONOREPO_TOOL="none"
MANIFESTS=()
[[ -f package.json ]]       && MANIFESTS+=("node")
[[ -f pnpm-workspace.yaml ]] && { MONOREPO_TOOL="pnpm"; MANIFESTS+=("pnpm-workspace"); }
[[ -f pnpm-lock.yaml ]]      && MANIFESTS+=("pnpm-lock")
[[ -f yarn.lock ]]           && MANIFESTS+=("yarn-lock")
[[ -f package-lock.json ]]   && MANIFESTS+=("npm-lock")
[[ -f bun.lockb ]]           && MANIFESTS+=("bun-lock")
[[ -f nx.json ]]             && MONOREPO_TOOL="nx"
[[ -f turbo.json ]]          && MONOREPO_TOOL="turborepo"
[[ -f lerna.json ]]          && MONOREPO_TOOL="lerna"
[[ -f Cargo.toml ]]          && MANIFESTS+=("cargo")
[[ -f Cargo.lock ]]          && MANIFESTS+=("cargo-lock")
[[ -f go.work ]]             && MONOREPO_TOOL="go-workspace"
[[ -f go.mod ]]              && MANIFESTS+=("go-mod")
[[ -f pyproject.toml ]]      && MANIFESTS+=("pyproject")
[[ -f poetry.lock ]]         && MONIFESTS+=("poetry-lock")
[[ -f uv.lock ]]             && MANIFESTS+=("uv-lock")
[[ -f requirements.txt ]]    && MANIFESTS+=("pip")
[[ -f pom.xml ]]             && MANIFESTS+=("maven")
[[ -f build.gradle.kts ]]    && MANIFESTS+=("gradle-kts")
[[ -f build.gradle ]]        && MANIFESTS+=("gradle")
[[ -f settings.gradle.kts ]] && MANIFESTS+=("gradle-kts-settings")
[[ -f WORKSPACE.bazel ]]     && MANIFESTS+=("bazel")
[[ -f MODULE.bazel ]]        && MANIFESTS+=("bazel-module")
[[ -f Package.swift ]]       && MANIFESTS+=("swift-pm")
[[ -f Project.swift ]]       && MANIFESTS+=("swift-pm-project")
[[ -d .xcodeproj ]]          && MANIFESTS+=("xcode")
[[ -d .xcworkspace ]]        && MANIFESTS+=("xcode-workspace")
[[ -f settings.gradle ]]     && MANIFESTS+=("gradle-settings")
[[ -f composer.json ]]       && MANIFESTS+=("composer")
[[ -f Gemfile ]]             && MANIFESTS+=("bundler")
[[ -f mix.exs ]]             && MANIFESTS+=("elixir-mix")

JSON+=", \"monorepo_tool\": \"$MONOREPO_TOOL\""
JSON+=", \"manifests\": [$(printf '"%s",' "${MANIFESTS[@]}" | sed 's/,$//')]"

# 4. 主语言（按文件后缀统计）
LANG_JSON=""
TOTAL=$FILE_COUNT
if [[ $TOTAL -eq 0 ]]; then TOTAL=1; fi
# 跨平台 find 否定词：GNU=-not, BSD=!
_NEG="!"
[[ "$(_os_name)" == "linux" ]] && _NEG="-not"
for ext in ts tsx js jsx py go rs java kt swift c cpp h rb php ex exs; do
  N=$(find . -type f -name "*.$ext" $_NEG -path './.git/*' $_NEG -path './node_modules/*' 2>/dev/null | wc -l | tr -d ' ')
  [[ $N -gt 0 ]] && LANG_JSON+="\"$ext\": $N, "
done
LANG_JSON="${LANG_JSON%, }"
JSON+=", \"lang_stats\": { $LANG_JSON }"

# 5. 包/模块列表（按 monorepo 工具）
PACKAGES=()
case "$MONOREPO_TOOL" in
  pnpm)
    # 从 pnpm-workspace.yaml 解析
    if [[ -f pnpm-workspace.yaml ]]; then
      while IFS= read -r pkg; do
        PACKAGES+=("$pkg")
      done < <(grep -E "^\s*-\s+'?" pnpm-workspace.yaml | sed -E "s/^\s*-\s*'?//; s/'?$//" | sed 's|/\*$||' | while read -r glob; do
        for d in $glob; do
          [[ -d "$d" ]] && _realpath "$d"
        done
      done)
    fi
    ;;
  turborepo|nx)
    # 探测 apps/ packages/ 或基于 manifest 推断
    for d in apps packages libs modules services; do
      if [[ -d "$d" ]]; then
        for sub in "$d"/*; do
          [[ -d "$sub" ]] && PACKAGES+=("$(_realpath "$sub")")
        done
      fi
    done
    ;;
  yarn-workspace|npm-workspace)
    if [[ -f package.json ]] && grep -q '"workspaces"' package.json; then
      if _have python3; then
        while IFS= read -r p; do
          PACKAGES+=("$p")
        done < <(python3 -c "import json; p=json.load(open('package.json')); [print(w.rstrip('/*')) for w in p.get('workspaces',[])]" 2>/dev/null)
      elif _have python; then
        while IFS= read -r p; do
          PACKAGES+=("$p")
        done < <(python -c "import json; p=json.load(open('package.json')); [print(w.rstrip('/*')) for w in p.get('workspaces',[])]" 2>/dev/null)
      elif _have node; then
        while IFS= read -r p; do
          PACKAGES+=("$p")
        done < <(node -e "const p=require('./package.json'); (p.workspaces||[]).forEach(w=>console.log(w.replace(/\/?\*?\$/,'')));" 2>/dev/null)
      elif _have jq; then
        while IFS= read -r p; do
          PACKAGES+=("$p")
        done < <(jq -r '.workspaces[]? // empty' package.json 2>/dev/null | sed 's|/\*||')
      fi
    fi
    ;;
  go-workspace)
    [[ -f go.work ]] && grep -E "^\s*(\./|use )" go.work | awk '{print $2}' | sed 's|^\./||' | while read -r d; do
      [[ -d "$d" ]] && _realpath "$d"
    done
    ;;
  cargo-workspace)
    [[ -f Cargo.toml ]] && grep -E "^\s*members\s*=" Cargo.toml | sed -E 's/.*\[\s*//; s/\s*].*//' | tr ',' '\n' | tr -d '"' | tr -d "'" | while read -r d; do
      d=$(echo "$d" | xargs)
      [[ -n "$d" && -d "$d" ]] && _realpath "$d"
    done
    ;;
  poetry|uv)
    [[ -f pyproject.toml ]] && grep -E "^\s*include\s*=" pyproject.toml | sed -E 's/.*\[\s*//; s/\s*].*//' | tr ',' '\n' | tr -d '"' | tr -d "'" | while read -r d; do
      d=$(echo "$d" | xargs)
      [[ -n "$d" && -d "$d" ]] && _realpath "$d"
    done
    ;;
esac

# 补充：即便 monorepo_tool=none，也探测常见结构
if [[ ${#PACKAGES[@]} -eq 0 ]]; then
  for d in apps packages services libs modules; do
    if [[ -d "$d" ]]; then
      for sub in "$d"/*; do
        [[ -d "$sub" && -f "$sub/package.json" || -f "$sub/pyproject.toml" || -f "$sub/Cargo.toml" || -f "$sub/go.mod" ]] && PACKAGES+=("$(_realpath "$sub")")
      done
    fi
  done
fi

PKG_JSON=""
for p in "${PACKAGES[@]}"; do
  PKG_JSON+="\"$p\", "
done
PKG_JSON="${PKG_JSON%, }"
JSON+=", \"packages\": [ $PKG_JSON ]"
JSON+=", \"package_count\": ${#PACKAGES[@]}"

# 6. 嵌套 monorepo 检测
NESTED=""
while IFS= read -r nested_pkg; do
  NESTED+="$nested_pkg, "
done < <(find . -mindepth 3 -maxdepth 6 -type f \( -name package.json -o -name pnpm-workspace.yaml -o -name Cargo.toml -o -name go.mod -o -name pyproject.toml \) $_NEG -path './node_modules/*' 2>/dev/null | while read -r f; do
  if grep -q '"workspaces"' "$f" 2>/dev/null || grep -q "^\s*members\s*=" "$f" 2>/dev/null || [[ -f "${f%/*}/pnpm-workspace.yaml" ]]; then
    echo "$(dirname "$f")"
  fi
done)
JSON+=", \"nested_monorepos\": [ ${NESTED%, } ]"

# 7. 已有 CLAUDE.md 位置
EXISTING_CLAUDE=""
while IFS= read -r f; do
  EXISTING_CLAUDE+="\"$(_realpath "$f")\", "
done < <(find . -name "CLAUDE.md" $_NEG -path './node_modules/*' 2>/dev/null)
JSON+=", \"existing_claude_md\": [ ${EXISTING_CLAUDE%, } ]"

# 8. 已有 AGENTS.md（OpenCode/Codex）
EXISTING_AGENTS=""
while IFS= read -r f; do
  EXISTING_AGENTS+="\"$(_realpath "$f")\", "
done < <(find . -name "AGENTS.md" $_NEG -path './node_modules/*' 2>/dev/null)
JSON+=", \"existing_agents_md\": [ ${EXISTING_AGENTS%, } ]"

# 9. 已有 .claude/rules/
HAS_RULES="false"
[[ -d .claude/rules ]] && HAS_RULES="true"
JSON+=", \"has_claude_rules\": $HAS_RULES"

# 10. 测试/lint/dev 命令探测（最常见的）
DETECTED_COMMANDS="{"
# 用 sed + grep 替代 node 解析 package.json（避免依赖 node）
_pkg_get_script() {
  # $1 = script name
  # 输出 scripts.<name> 的值，无则空
  local name="$1"
  if [[ ! -f package.json ]]; then return; fi
  # 用 python/node/jq 中任一个解析
  if _have python3; then
    python3 -c "import json,sys; p=json.load(open('package.json')); print(p.get('scripts',{}).get('$name',''))" 2>/dev/null
  elif _have python; then
    python -c "import json,sys; p=json.load(open('package.json')); print(p.get('scripts',{}).get('$name',''))" 2>/dev/null
  elif _have node; then
    node -e "try{const p=require('./package.json');console.log(p.scripts?.$name||'')}catch(e){}" 2>/dev/null
  elif _have jq; then
    jq -r ".scripts.$name // \"\"" package.json 2>/dev/null
  else
    # 兜底：sed 粗暴提取（容忍格式不规范）
    sed -nE "s/.*\"$name\"[[:space:]]*:[[:space:]]*\"([^\"]*)\".*/\1/p" package.json | head -1
  fi
}
[[ -f package.json ]] && {
  TEST_CMD=$(_pkg_get_script test)
  LINT_CMD=$(_pkg_get_script lint)
  DEV_CMD=$(_pkg_get_script dev)
  BUILD_CMD=$(_pkg_get_script build)
  [[ -n "$TEST_CMD" ]] && DETECTED_COMMANDS+="\"test\":\"$TEST_CMD\","
  [[ -n "$LINT_CMD" ]] && DETECTED_COMMANDS+="\"lint\":\"$LINT_CMD\","
  [[ -n "$DEV_CMD" ]] && DETECTED_COMMANDS+="\"dev\":\"$DEV_CMD\","
  [[ -n "$BUILD_CMD" ]] && DETECTED_COMMANDS+="\"build\":\"$BUILD_CMD\","
}
[[ -f pyproject.toml ]] && {
  grep -q "pytest" pyproject.toml 2>/dev/null && DETECTED_COMMANDS+="\"test\":\"pytest\","
  grep -q "ruff" pyproject.toml 2>/dev/null && DETECTED_COMMANDS+="\"lint\":\"ruff check .\","
  grep -q "black" pyproject.toml 2>/dev/null && DETECTED_COMMANDS+="\"format\":\"black .\","
}
[[ -f Cargo.toml ]] && DETECTED_COMMANDS+="\"test\":\"cargo test\",\"lint\":\"cargo clippy\",\"build\":\"cargo build\","
[[ -f go.mod ]] && DETECTED_COMMANDS+="\"test\":\"go test ./...\",\"lint\":\"go vet ./...\",\"build\":\"go build ./...\","
[[ -f pom.xml ]] && DETECTED_COMMANDS+="\"test\":\"mvn test\",\"build\":\"mvn package\","
[[ -f build.gradle || -f build.gradle.kts ]] && DETECTED_COMMANDS+="\"test\":\"gradle test\",\"build\":\"gradle build\","
DETECTED_COMMANDS="${DETECTED_COMMANDS%, }"
DETECTED_COMMANDS+=" }"
JSON+=", \"detected_commands\": $DETECTED_COMMANDS"

# 11. 总体复杂度评分（用于决策阶段）
COMPLEXITY="low"
if [[ $FILE_COUNT -gt 200 ]]; then COMPLEXITY="medium"; fi
if [[ $FILE_COUNT -gt 1000 ]] || [[ ${#PACKAGES[@]} -gt 3 ]]; then COMPLEXITY="high"; fi
if [[ $FILE_COUNT -gt 5000 ]] || [[ ${#PACKAGES[@]} -gt 10 ]]; then COMPLEXITY="very-high"; fi
JSON+=", \"complexity\": \"$COMPLEXITY\""

# 12. 推荐的"是否拆分"初步建议
RECOMMENDATION="none"
if [[ $FILE_COUNT -lt 200 && ${#PACKAGES[@]} -lt 2 ]]; then
  RECOMMENDATION="single-root"
elif [[ $FILE_COUNT -lt 1000 && ${#PACKAGES[@]} -lt 4 ]]; then
  RECOMMENDATION="root-only-or-shallow"
elif [[ ${#PACKAGES[@]} -ge 3 ]]; then
  RECOMMENDATION="root-plus-subdirs"
else
  RECOMMENDATION="evaluate"
fi
JSON+=", \"recommendation\": \"$RECOMMENDATION\""

JSON+=" }"
emit "$JSON"
echo

# Human-readable summary 到 stderr
cat >&2 <<EOF
=== 项目探测摘要 ===
仓库根:   $(_realpath "$REPO")
Git:      $([ -d .git ] && echo yes || echo no)
文件数:   $FILE_COUNT
复杂度:   $COMPLEXITY
Monorepo: $MONOREPO_TOOL
包数:     ${#PACKAGES[@]}
推荐:     $RECOMMENDATION
====================
EOF
