# 跨平台兼容性说明

## 目标平台

| 平台 | 支持级别 | 备注 |
|---|---|---|
| Linux (GNU coreutils) | ✅ 完全支持 | 推荐环境 |
| macOS (BSD userland) | ✅ 完全支持 | 自动降级 |
| WSL (Windows Subsystem for Linux) | ✅ 完全支持 | 视同 Linux |
| Git Bash (msys/cygwin) | ✅ 支持 | 可能需要补 perl |
| 原生 Windows (PowerShell/CMD) | ❌ 不支持 | 用 WSL 或 Git Bash |

## 平台差异表

| 工具/特性 | Linux (GNU) | macOS (BSD) | 兼容方案 |
|---|---|---|---|
| `realpath` | 默认有 | 默认**没有** | `_realpath` 兜底到 `readlink -f` → `cd && pwd -P` |
| `find -not -path` | 支持 | **不支持**（用 `!`） | `_NEG` 变量按平台切换 |
| `find -E` (ERE) | `find` | `find -E` | 用 `grep -E` 替代正则 |
| `perl` | 大多有 | 自带 `/usr/bin/perl` | perl 优先，缺失时降级到 awk |
| `node` | 可选 | 可选 | JSON 解析回退到 python3 / python / jq / sed |
| `python3` | 大多有 | `brew install python` | 同上 |
| `jq` | 大多有 | `brew install jq` | 同上 |
| `bash 5+` | 新发行版 | macOS 默认 **3.2** | 脚本只用 POSIX + bash 3.2+ 兼容特性 |
| `set -o pipefail` | bash 4+ | bash 3.2 OK | 脚本不强制开启 |
| 路径分隔符 | `/` | `/` | 一致 |

## 关键兼容点详解

### 1. `realpath` 替代

`realpath` 在 macOS 默认未装（coreutils 不预装）。`readlink -f` 在 GNU 和 BSD 都支持，作为首选兜底。最后兜底是 `cd <dir> && pwd -P`（POSIX 兼容）。

`_lib.sh` 里的 `_realpath`：

```bash
_realpath() {
  local p="${1:-}"
  command -v realpath >/dev/null 2>&1 && { realpath "$p"; return; }
  readlink -f "$p" 2>/dev/null && return
  (cd "$(dirname -- "$p")" 2>/dev/null && printf '%s/%s\n' "$(pwd -P)" "$(basename -- "$p")")
}
```

### 2. `find -not` vs `find !`

BSD `find` 不支持 `-not`，必须用 POSIX 标准的 `!`：

```bash
# GNU
find . -type f -not -path '*/node_modules/*'

# BSD / macOS
find . -type f ! -path '*/node_modules/*'
```

所有脚本都用 `_NEG` 变量按平台自动切换：

```bash
_NEG="!"
[[ "$(_os_name)" == "linux" ]] && _NEG="-not"
find . $_NEG -path '*/node_modules/*'
```

### 3. 模板渲染：perl vs awk

perl 在 macOS（`/usr/bin/perl`）/ Linux / WSL 都自带。只有 Git Bash（msys）可能没有（需要装 Strawberry Perl）。

awk 降级路径：用 `\x01` 占位符中转，绕过 gsub 替换串中 `&` 始终是元字符的限制。

**awk 降级限制**：
- ❌ 不支持值含真换行符（`\n` 字面字符）
- ✅ 支持 `&&`、`<`、`>`、反斜杠等特殊字符（经占位符转义后）
- ✅ 支持 Unicode（awk 1.3+）

### 4. JSON 解析：四选一

`_json_get` 优先级：

1. `node -e` （最通用）
2. `python3 -c`
3. `python -c`
4. `jq -r`
5. `sed` 兜底（仅支持 `package.json` 的 `scripts` 字段等简单场景）

Git Bash 用户最常见的问题是 `node` 缺失。安装一个即可：
- `winget install OpenJS.NodeJS.LTS`
- `scoop install nodejs`
- `choco install nodejs`

### 5. 路径处理

脚本内统一用 `$(cd ... && pwd -P)` 拿绝对路径，避免依赖 `realpath`。所有 `_realpath` 调用都走兼容层。

Git Bash 下路径可能带 `/c/Users/...` 或 `/mnt/c/...`，但都是 POSIX 风格，`bash` 透明处理。

## 各平台安装清单

### macOS

```bash
# 必装（已自带）
# bash、awk、sed、grep、find、perl

# 推荐装（脚本兼容但更顺）
brew install node
# 或
brew install python3
# 或
brew install jq
```

### WSL

```bash
sudo apt update
sudo apt install -y bash findutils coreutils perl nodejs python3 jq git
```

### Git Bash (Windows)

```powershell
# 1. 装 Git for Windows（带 Git Bash）
# 2. 装 perl（强烈推荐）
scoop install strawberry-perl
# 或
choco install strawberryperl

# 3. 装一个 JSON 解析器
scoop install nodejs-lts
# 或
scoop install jq
```

### 原生 Windows PowerShell/CMD

不支持。请用 WSL 或 Git Bash。

## 验证脚本

跑 `os-detect.sh` 看完整环境状态：

```bash
bash <skill-dir>/scripts/os-detect.sh
```

输出示例（macOS 缺 node）：

```
=== 平台检测 ===
uname -s:        Darwin
平台:            darwin
bash:            3.2.57(1)-release
...

=== 关键工具 ===
realpath:        no（用 readlink -f/pwd 兜底）
perl:            yes
node:            no
python3:         yes
...

=== 兼容性结论 ===
macOS 平台：realpath/find -not/perl 已自动降级
🟡 缺 JSON 解析器：装 node (brew install node) 或 python3
✅ 必需工具可用
```

## CI 矩阵

如果项目要 CI 测试 skill 在多平台可用，最小矩阵：

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest]
    shell: [bash]
runs-on: ${{ matrix.os }}
steps:
  - uses: actions/checkout@v4
  - run: bash scripts/os-detect.sh
  - run: bash scripts/detect-project.sh ./test-repo
  - run: bash scripts/render-template.sh templates/pkg-pnpm.md.tmpl vars.json out.md
```

## 已知限制

1. **macOS 默认 bash 3.2 不支持 `declare -g` / `mapfile` 等 4+ 特性**：本 skill 不用这些。
2. **Git Bash 下 `set -o pipefail` 在某些 msys 版本会警告**：脚本未强制开启，规避。
3. **Windows 原生 PowerShell 不支持 bash 脚本**：需 WSL。
4. **awk 降级不支持多行值**：建议装 perl（macOS/WSL 自带）。
5. **BSD `sed -i` 需要备份后缀**（`sed -i ''`）：本 skill 只用 `sed -i` 不带后缀的场景，避开。

## 调试技巧

如果脚本在某平台报错：

```bash
# 1. 看环境
bash <skill-dir>/scripts/os-detect.sh

# 2. 启用 bash 调试
bash -x <skill-dir>/scripts/detect-project.sh /path/to/repo

# 3. 单独测 JSON 解析
echo '{"a":"b && c"}' > /tmp/t.json
source <skill-dir>/scripts/_lib.sh
_json_get /tmp/t.json a
```

## 报告 bug

如果发现新平台兼容问题，提交 issue 时附：

1. `os-detect.sh` 完整输出
2. `bash -x <脚本>` 输出
3. `uname -a`
4. `bash --version`
