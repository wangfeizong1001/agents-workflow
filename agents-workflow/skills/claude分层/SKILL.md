---
name: claude-md-layered
version: 1.1.0
description: 为任意规模、任意语言、任意 monorepo 工具的仓库自动设计并落地 CLAUDE.md 分层方案（根 + 子目录 + 路径谓词）。覆盖检测、决策、生成、迁移、验证全流程。跨 Linux / macOS / WSL / Git Bash。
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
triggers:
  - 分层 CLAUDE.md
  - 拆分 CLAUDE.md
  - 子目录 CLAUDE.md
  - 优化 CLAUDE.md
  - claude md 太大
  - claude md 分层
  - 子目录约定
  - layered claude md
  - split claude md
  - 子目录启动
  - CLAUDE.md 自动审查
  - 自动更新 CLAUDE.md
  - Stop Hook
  - claude md review
  - claude md 过期
platforms:
  - linux
  - darwin
  - wsl
  - git-bash
---

## 何时调用本 skill

调用本 skill 当且仅当用户表达以下任一意图：

- "CLAUDE.md 太长 / 跑得慢 / 串频道" → **重构/拆分**
- "帮我建一套分层 CLAUDE.md" → **从零生成**
- "为这个项目设计 CLAUDE.md" → **设计+生成**
- "CLAUDE.md 自动审查 / 自动更新 / Stop Hook" → **装自动维护**
- "为这个 monorepo 写 CLAUDE.md" → **生成 monorepo 分层**
- "子目录 CLAUDE.md 怎么写" / "要不要拆" → **决策建议**

**不要**在以下情况调用：

- 用户只问 CLAUDE.md 是什么 → 直接解释，不调用
- 项目 < 30 文件且无明显领域分化 → 解释"为什么不用拆"
- 用户想看演示示例 → 用 `templates/` 里的样例回答，不动仓库

## 设计原则（贯穿全 skill）

1. **根文件做指针，不做字典**。只放跨领域、跨子目录都成立的内容。
2. **子目录文件管自己的一亩三分地，不越界**。与根文件零内容重叠。
3. **进了哪个目录就用哪个目录的命令**。每个子目录文件自带 test/lint/dev 命令。
4. **先探测，再决策，最后生成**。禁止跳过探测直接套模板。
5. **优先用项目已有约定**。检测到 ESLint/Prettier/Conventions/ADR 等设施时，引用而非重复。

## 两种使用模式

| 模式 | 何时 | 触发 | 输出 |
|---|---|---|---|
| **设计模式**（主动） | 新项目 / 拆分老项目 | 显式调用本 skill | 一次性的根 + 子目录 CLAUDE.md |
| **维护模式**（被动） | 已有项目跑了一段时间 | 装 Stop Hook 自动跑 | 每次会话后一份审查建议 |

**设计模式**跑一遍得到的是静态分层结构；**维护模式**装上后长期生效，两者不冲突。本 skill 同时支持。

## 自动维护模式（Stop Hook）

**原理**：每次 Claude Code 会话结束 → 启动一个无头 Claude 子会话 → 读 `git diff HEAD~1` + 路径上所有 `CLAUDE.md` → 让 Claude 审查规则是否过期 → 写建议到 `.claude/claude-md-review.md`（**不直接改源文件**）。

### 装

```bash
bash <skill-dir>/scripts/install-hook.sh --target /path/to/repo
```

自动做的事：

- 复制 `.claude/hooks/propose_claude_md.py`
- 合并到 `.claude/settings.json`（已存在则合并，不覆盖）
- 加 `.gitignore` 排除审查输出
- 跨平台：Linux / macOS / WSL / Git Bash 全支持

### 卸

```bash
bash <skill-dir>/scripts/install-hook.sh --target /path/to/repo --uninstall
```

### 工作机制（三道安全阀）

1. **防递归**：`CLAUDE_MD_REVIEW_LOCK=1` 环境变量，检测到即跳过
2. **优雅降级**：无 `claude` CLI 或执行失败 → 只列改动区域，不阻塞
3. **不自动改源**：建议写审查文件，改不改由人决定

### 调环境变量

| 变量 | 默认 | 作用 |
|---|---|---|
| `CLAUDE_MD_REVIEW_MODEL` | 沿用 CLI | 指定模型（建议 `haiku` 省 token） |
| `CLAUDE_MD_REVIEW_DIFF` | `HEAD~1` | diff 来源，可选 `staged+unstaged` |
| `CLAUDE_MD_REVIEW_FILE` | `.claude/claude-md-review.md` | 审查输出位置 |
| `CLAUDE_MD_REVIEW_DEBUG` | `0` | `1`=打印详细日志到 stderr |
| `CLAUDE_MD_REVIEW_SKIP` | `0` | `1`=跳过本轮（紧急停用） |

在 `settings.json` 里加：

```json
{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "CLAUDE_MD_REVIEW_MODEL=haiku python .claude/hooks/propose_claude_md.py"
      }]
    }]
  }
}
```

### 适合谁用

- ✅ 代码库频繁迭代，新约定每周出现
- ✅ CLAUDE.md 分层放在多个子目录（人手检查不现实）
- ✅ 多人共用项目，需要中立审查者
- ❌ 一个人维护稳定小项目 → 每几个月手动 review 就够了

### 跟设计模式的关系

| 阶段 | 用什么 |
|---|---|
| 项目初始化 | 跑设计模式生成第一套 CLAUDE.md |
| 跑 1 个月后 | 装 Stop Hook，开始自动审查 |
| CLAUDE.md 真出问题 | 审查文件会指出"路径已重命名"等，再跑一次设计模式局部重构 |

## 工作流（七阶段）

```
[阶段 1] 探测   → [阶段 2] 盘点 → [阶段 3] 决策
                                          ↓
[阶段 7] 文档  ← [阶段 6] 验证 ← [阶段 5] 生成
```

### 阶段 1：探测（强制）

调用 `scripts/detect-project.sh <repo-root>`，必须拿到：

- 仓库根绝对路径
- 是否 git 仓库
- 顶层语言/构建工具（按优先级：manifest 文件 → lockfile → 文件后缀统计）
- 是否 monorepo（workspace 声明）
- monorepo 类型（pnpm / yarn / npm / lerna / nx / turborepo / cargo / go / poetry / uv / maven / gradle / bazel）
- 包/模块列表及路径
- 嵌套 monorepo 标记

**如果探测失败**（无 manifest、无 lockfile、无法识别）：进入"降级路径"，按"单包通用"处理，**不要**硬猜 monorepo 结构。

### 阶段 2：盘点

调用 `scripts/analyze-existing-claude-md.sh <repo-root>`，必须拿到：

- 已存在的 CLAUDE.md 路径列表
- 每个文件的行数
- 是否存在"如果你在 X 目录工作"条件句
- 是否存在 `~/.claude/rules/` 或 `.claude/rules/`
- 是否存在 `AGENTS.md`（OpenCode/Codex 风格）

### 阶段 3：决策（读 `references/decision-tree.md`）

根据探测+盘点结果，决定以下五件事：

| 决策项 | 取值 |
|---|---|
| 1. 拆不拆 | `不拆` / `仅根` / `根+一层子` / `根+多层子` / `根+子+规则` |
| 2. 根文件目标行数 | `≤80` / `50-80` / `≤50` |
| 3. 子目录切分粒度 | `按包` / `按领域` / `按层（handlers/services）` |
| 4. 是否需要 `.claude/rules/` | 是/否 |
| 5. 是否需要迁移旧文件 | 是/否（含迁移方案） |

**决策输出**必须用一段自然语言 + 表格给用户看，得到用户确认后再进入生成阶段。

### 阶段 4：规划（生成前与用户对齐）

用 `AskUserQuestion` 或简短对话与用户确认：

1. 仓库类型探测结果（语言、monorepo 工具）
2. 拆分方案（哪几个子目录、每个文件大致的章节）
3. 是否要 `.claude/rules/` 进阶配置
4. 是否要在每个子目录里写特定命令（如果探测没拿到）

### 阶段 5：生成

**绝对不要**直接写裸的 CLAUDE.md。必须：

1. 选模板：从 `templates/` 选与项目类型匹配的 `.tmpl` 文件
2. 用 `scripts/render-template.sh <tmpl> <vars.json>` 渲染
3. 把 vars 写入 `.claude-md-gen/last-vars.json`（用于审计）

每个生成的 CLAUDE.md 末尾**必须**含"反向链接"段落，列出同级+上级+下级 CLAUDE.md，让 Claude 知道上下文边界。

### 阶段 6：验证

按以下顺序逐项验证，全过才视为完成：

1. **加载边界**：在最深子目录启动 Claude，让它列出所有加载的 CLAUDE.md 路径+行数
2. **行数预算**：根 ≤ 80 行（特例 ≤ 120），子目录 20-50 行
3. **零重叠**：grep 根与子目录"约定"段落，无重复
4. **命令有效**：每个子目录文件里的 test/lint/dev 命令实际能跑（dry-run 可接受）
5. **路径谓词**：若启用了 `.claude/rules/`，改对应文件时验证规则被加载

任何一项不通过，回到阶段 5 重做。

### 阶段 7：文档

生成 `docs/claude-md-layers.md`（或追加到项目已有 docs）记录：

- 当前分层结构图
- 决策依据（为什么这样拆）
- 维护规则（何时增删文件、子目录文件升级到根文件的标准）
- 关联 skill 触发条件

## 项目类型 → 模板映射表

| 探测结果 | 根模板 | 子目录模板（默认） |
|---|---|---|
| pnpm + 多包 | `templates/root-pnpm-monorepo.md.tmpl` | `templates/pkg-pnpm.md.tmpl` |
| yarn/npm workspaces | `templates/root-yarn-npm-monorepo.md.tmpl` | `templates/pkg-pnpm.md.tmpl`（命令改 yarn/npm） |
| Turborepo 顶层 | `templates/root-turborepo.md.tmpl` | `templates/pkg-pnpm.md.tmpl` |
| Nx 顶层 | `templates/root-nx.md.tmpl` | `templates/pkg-nx.md.tmpl` |
| 单包 Node/TS | `templates/root-single.md.tmpl` | 不拆 |
| Next.js app | `templates/root-nextjs.md.tmpl` | `templates/nextjs-app.md.tmpl`（按需） |
| Python Poetry | `templates/root-poetry-monorepo.md.tmpl` | `templates/pkg-poetry.md.tmpl` |
| Python uv workspace | `templates/root-uv-monorepo.md.tmpl` | `templates/pkg-uv.md.tmpl` |
| Python 单包 | `templates/root-python-single.md.tmpl` | 不拆 |
| Go workspace | `templates/root-go-workspace.md.tmpl` | `templates/pkg-go.md.tmpl` |
| Go 单 module | `templates/root-go-single.md.tmpl` | 不拆 |
| Cargo workspace | `templates/root-cargo-workspace.md.tmpl` | `templates/pkg-rust.md.tmpl` |
| Rust 单 crate | `templates/root-rust-single.md.tmpl` | 不拆 |
| Maven 多模块 | `templates/root-maven.md.tmpl` | `templates/pkg-maven.md.tmpl` |
| Gradle 多模块 | `templates/root-gradle.md.tmpl` | `templates/pkg-gradle.md.tmpl` |
| iOS app（Xcode） | `templates/root-ios.md.tmpl` | `templates/ios-target.md.tmpl` |
| Android | `templates/root-android.md.tmpl` | `templates/android-module.md.tmpl` |
| Bazel | `templates/root-bazel.md.tmpl` | `templates/pkg-bazel.md.tmpl` |
| **降级（识别不出）** | `templates/root-unknown.md.tmpl` | 不拆，提示用户补 manifest |

## 路径谓词模板（`.claude/rules/` 进阶）

按文件类型触发的规则，与目录 CLAUDE.md 互补：

| 模板 | 触发条件 | 典型内容 |
|---|---|---|
| `templates/rules/tsx-components.md.tmpl` | `**/*.tsx` | 组件 props 类型、禁止 default export |
| `templates/rules/api-routes.md.tmpl` | `**/routes/**` / `**/handlers/**` | 路由命名、错误处理 |
| `templates/rules/db-migrations.md.tmpl` | `**/migrations/**` / `**/prisma/migrations/**` | 迁移顺序、回滚 |
| `templates/rules/tests.md.tmpl` | `**/*.test.*` / `**/*.spec.*` | 测试命名、断言风格 |
| `templates/rules/config-files.md.tmpl` | `**/config/**` / `**/*.config.*` | 改 config 必跑哪些测试 |

## 边界情况处理

### B1. 项目太小不拆

触发条件（满足任一）：

- 总文件数 < 200
- 仅一个 manifest，无 workspace 声明
- 仅一个领域（如纯单页 Next.js app）
- 根 CLAUDE.md < 60 行

**动作**：直接给"根单文件"模板，不进入子目录拆分流程。告诉用户为什么不用拆。

### B2. 仓库已存在根 CLAUDE.md（迁移）

调用 `scripts/migrate-existing-claude-md.sh`（在 scripts 目录）：

1. 自动把"如果...那么..."条件句提取到对应子目录文件
2. 把"跨领域内容"留在根
3. 把"包专属命令"移到子目录
4. 生成 `CLAUDE.md.bak` 备份
5. 输出 diff 摘要让用户审

### B3. 嵌套 monorepo

`packages/foo/apps/bar` 这种结构：每个 workspace 边界各放一份 CLAUDE.md。
特例：内部 workspace 没必要逐个放，遵循"按领域切，不按 workspace 切"。

### B4. 已有 `.claude/rules/` 但无 CLAUDE.md

先补根 CLAUDE.md（用 `root-unknown.md.tmpl`），rules 不动。

### B5. 已有 `AGENTS.md`

以 AGENTS.md 为主，CLAUDE.md 视为别名或软链即可。模板里所有 `CLAUDE.md` 占位符用 `AGENTS.md` 替换。

### B6. 多开发者并发改 CLAUDE.md

在生成时写入 `docs/claude-md-layers.md` 的"维护规则"章节明确：

- 根文件改动需 2 人 review
- 子目录文件 owner=该包 owner
- 文件 < 10 行 → 合并到上级

### B7. 用户用 OpenCode 而非 Claude Code

`.claude/rules/` 在 OpenCode 中**不**自动加载。改用 `AGENTS.md` + 子目录 `AGENTS.md`。
skill 会检测到 `AGENTS.md` 存在时自动切换。

## 验证脚本

```bash
# 1. 加载边界
cd <deepest-subdir> && claude
# 问 Claude：列出当前加载的所有 CLAUDE.md 路径和行数

# 2. 行数预算
scripts/check-line-budget.sh <repo-root>

# 3. 零重叠
scripts/check-overlap.sh <repo-root>

# 4. 命令可用性（dry-run）
scripts/check-commands.sh <repo-root>
```

## 反模式（agent 自我检查清单）

- ❌ 根文件出现条件句"如果你在 X 目录"
- ❌ 子目录文件照搬根文件的"约定"段落
- ❌ 每个子目录文件都写"用 TypeScript strict 模式"（这是全局约定）
- ❌ 给每个 src 子目录都建 CLAUDE.md（拆过了）
- ❌ 写"参考 README.md"而不写真实内容（CLAUDE.md 不是索引）
- ❌ 把命令别名（如 `pnpm test`）分散在根和子目录两处
- ❌ 在子目录文件里写跨包依赖说明（应放根或 shared 包专属文件）

## 完成定义（DoD）

- [ ] 探测脚本输出完整（语言、monorepo、包列表）
- [ ] 决策结果以表格形式与用户确认
- [ ] 至少生成根 CLAUDE.md（≤ 80 行，单包项目除外）
- [ ] 至少一个子目录 CLAUDE.md（按决策结果）
- [ ] 验证四步全过
- [ ] `docs/claude-md-layers.md` 已生成或追加
- [ ] git status 干净，commit 信息：`分层: 设计并落地 CLAUDE.md 分层方案`

## 失败模式

| 失败 | 回退 |
|---|---|
| 探测脚本无法识别项目类型 | 走"降级"路径 + 提示用户补 manifest |
| 用户拒绝拆分方案 | 退回到"仅根"模式，给出最简模板 |
| 验证第 2 步（行数）不通过 | 把多出的内容下沉到下一层子目录 |
| 验证第 3 步（重叠）不通过 | 重写根文件，删除与子目录重复段落 |
| 验证第 4 步（命令）不通过 | 改子目录命令为 `cd ../.. && <full-cmd>` 兜底 |

## 与其他 skill/skill 的关系

- **与 `~/.claude/skills/gstack/ship/`**：本 skill 生成的文件应在 ship 前作为一次提交
- **与 `~/.claude/skills/gstack/plan-ceo-review/`**：决策阶段可引用其评估方法
- **与 `~/.claude/skills/gstack/health/`**：拆分后跑一遍 health 看是否改善
- **与 `investigate/`**：若拆分后 Claude 行为异常，回查本 skill 的验证步骤

## 配套脚本与模板

```
claude-md-layered/
├── SKILL.md                    # 本文件
├── scripts/
│   ├── _lib.sh                 # 跨平台兼容层（realpath / JSON / find -not / perl-or-awk）
│   ├── os-detect.sh            # 平台自检（Linux / macOS / WSL / Git Bash）
│   ├── detect-project.sh       # 阶段 1：项目类型/结构探测
│   ├── analyze-existing-claude-md.sh  # 阶段 2：盘点现有 CLAUDE.md
│   ├── migrate-existing-claude-md.sh  # B2：迁移旧文件
│   ├── render-template.sh      # 阶段 5：模板渲染
│   ├── check-line-budget.sh    # 验证 2：行数
│   ├── check-overlap.sh        # 验证 3：重叠检查
│   ├── check-commands.sh       # 验证 4：命令可用性
│   ├── propose_claude_md.py    # 维护模式：Stop Hook 脚本（Python 跨平台）
│   └── install-hook.sh         # 维护模式：一键安装/卸载 hook
├── templates/                  # 见"项目类型 → 模板映射表"
│   ├── root-*.md.tmpl
│   ├── pkg-*.md.tmpl
│   ├── nextjs-app.md.tmpl
│   ├── ios-target.md.tmpl
│   └── rules/
└── references/
    ├── decision-tree.md        # 阶段 3：决策树
    ├── migration.md            # 迁移指南
    └── anti-patterns.md        # 反模式详解
```

## 平台兼容性

支持：**Linux (GNU)** / **macOS (BSD)** / **WSL** / **Git Bash (msys)**。不原生支持 PowerShell/CMD（用 WSL/Git Bash）。

**关键兼容点**：
- `realpath` 在 macOS 缺失 → `_realpath` 兜底到 `readlink -f` / `pwd -P`
- `find -not` 在 BSD 不支持 → 用 `!`，脚本内 `_NEG` 自动切换
- `perl` 在 macOS/Linux/WSL 自带，Git Bash 需装 Strawberry Perl
- `node` 解析 JSON 不可用时降级到 python3 / python / jq / sed

完整对照表 + 平台安装指南见 `references/cross-platform.md`。

调用本 skill 前先跑平台自检：

```bash
bash <skill-dir>/scripts/os-detect.sh
```

## 触发后第一步

执行：

```bash
bash <skill-dir>/scripts/detect-project.sh "$(pwd)"
```

读取输出，进入阶段 2。**不要**在探测完成前开始写任何 CLAUDE.md。
