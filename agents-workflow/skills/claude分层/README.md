# claude-md-layered

为任意规模、任意语言、任意 monorepo 工具的仓库自动设计并落地 **CLAUDE.md 分层方案**（根 + 子目录 + 路径谓词）。

## 文件结构

```
claude-md-layered/
├── SKILL.md                    主入口（必读）
├── scripts/
│   ├── detect-project.sh       探测项目类型/结构
│   ├── analyze-existing-claude-md.sh
│   ├── migrate-existing-claude-md.sh
│   ├── render-template.sh
│   ├── check-line-budget.sh
│   ├── check-overlap.sh
│   └── check-commands.sh
├── templates/
│   ├── root-*.md.tmpl          8 个根模板
│   ├── pkg-*.md.tmpl           6 个子目录模板
│   ├── nextjs-app.md.tmpl
│   ├── ios-target.md.tmpl
│   └── rules/                  4 个路径谓词模板
└── references/
    ├── decision-tree.md        何时拆/拆到哪
    ├── migration.md            迁移指南
    └── anti-patterns.md        反模式
```

## 覆盖的项目类型

- Node.js/TS（pnpm / yarn / npm / bun / Turborepo / Nx / Lerna）
- Python（Poetry / uv / pip）
- Go（workspace）
- Rust（Cargo workspace）
- JVM（Maven / Gradle）
- iOS（Xcode / SwiftPM）
- Android（Gradle）
- Bazel
- 未知（降级到 root-unknown）

## 7 阶段工作流

```
探测 → 盘点 → 决策 → 规划 → 生成 → 验证 → 文档
```

详见 [SKILL.md](./SKILL.md)。

## 快速开始

```bash
# 1. 探测
bash scripts/detect-project.sh /path/to/repo

# 2. 盘点
bash scripts/analyze-existing-claude-md.sh /path/to/repo

# 3. 渲染
bash scripts/render-template.sh templates/pkg-pnpm.md.tmpl vars.json apps/api/CLAUDE.md
```
