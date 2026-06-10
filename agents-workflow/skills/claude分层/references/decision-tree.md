# 决策树：何时拆 / 拆到哪 / 用哪个模板

```
开始
  │
  ├─ 仓库 < 200 文件 且 单包 且 无条件句？
  │   └─ 是 → 【不拆】用 root-single.md.tmpl
  │
  ├─ 已有 CLAUDE.md？
  │   └─ 是 → 跑 analyze-existing-claude-md.sh
  │           ├─ 根 > 120 行 → 强制拆
  │           ├─ 根 80-120 行 + 条件句 → 拆
  │           └─ 根 < 80 行无条件句 → 暂不拆
  │
  ├─ 是否 monorepo？（workspace 声明）
  │   ├─ 否 → 用 root-single.md.tmpl（单包）
  │   └─ 是 → 探测 monorepo 工具
  │           ├─ pnpm workspace → root-pnpm-monorepo + pkg-pnpm
  │           ├─ yarn/npm workspace → 同上（命令前缀换）
  │           ├─ turborepo → root-turborepo + pkg-pnpm
  │           ├─ nx → root-nx + pkg-nx
  │           ├─ go workspace → root-go-workspace + pkg-go
  │           ├─ cargo workspace → root-cargo-workspace + pkg-rust
  │           ├─ poetry → root-poetry-monorepo + pkg-poetry
  │           ├─ uv workspace → root-pnpm-style + pkg-uv
  │           ├─ maven → root-maven + pkg-maven
  │           ├─ gradle → root-gradle + pkg-gradle
  │           ├─ xcode → root-ios + ios-target
  │           └─ bazel → root-bazel + pkg-bazel
  │
  └─ 拆分粒度
      ├─ ≤ 3 个包 → 根 + 每个包一份子目录
      ├─ 4-10 个包 → 根 + 每个包，根加"子目录索引"段
      └─ > 10 个包 → 根 + 包级 + 启用 .claude/rules/
```

## 拆分深度决策

```
拆到第几层？
  │
  ├─ 第一层（包）就够
  │   └─ 当：包内部子目录的约定与整个包一致
  │
  ├─ 第二层（包 → 子目录）需要
  │   └─ 当：子目录有不同的"约定"或"注意事项"
  │       例如：apps/api/src/handlers/ 冻结 legacy/，与其他目录不同
  │
  └─ 第三层（包 → 子目录 → 孙子目录）几乎不需要
      └─ 当：孙子目录有完全独立的 lint/构建命令（如 native add-on）
          或：包内多语言（既有 JS 又有 Rust FFI）
```

## 模板参数对照

调用 `render-template.sh` 时，vars.json 需要哪些字段？

| 模板 | 必填字段 | 可选字段 |
|---|---|---|
| root-pnpm-monorepo | REPO_NAME, PKG_MANAGER, MONOREPO_TOOL, PRIMARY_LANG, TEST_CMD, LINT_CMD, DEFAULT_BRANCH, PRECOMMIT_CMD, COMMIT_PREFIX, BUILD_TYPES_CMD, PKG1_PATH/2/3 + DESC | — |
| pkg-pnpm | PKG_NAME, PKG_SCOPE, CONVENTIONS_BULLET, PKG_TEST_CMD, PKG_LINT_CMD, PKG_DEV_CMD, NOTES_BULLET, SIBLING_PKGS, SUBDIR_HINT | — |
| rules/tsx-components | 无（路径谓词用 frontmatter） | — |
| root-unknown | DETECTED_TOOLS, TEST_CMD, LINT_CMD, BUILD_CMD, DIR_LIST | — |

## 工具特定补充

### pnpm + Turborepo
- 根用 `root-turborepo.md.tmpl`，子包共用 `pkg-pnpm.md.tmpl`（命令改成 `pnpm --filter <pkg>`）
- 任务管道写在 `turbo.json`，子包不重复

### Nx
- 必须用 `pkg-nx.md.tmpl`（命令是 `npx nx test <name>`，不是 `pnpm test`）
- 任务依赖靠 `project.json` 的 `targetDependencies`

### Go workspace
- `go.work` 在根，子包用 `pkg-go.md.tmpl`
- 共享 lint: `golangci-lint` 配置在根，子包引用

### Cargo workspace
- 共享配置在根 `Cargo.toml [workspace.dependencies]`
- 子包用 `pkg-rust.md.tmpl`

### Poetry / uv
- 根用 Poetry，monorepo 靠 `pyproject.toml [tool.poetry.packages]` 或 uv workspace
- 子包各自 `pyproject.toml`

### Bazel
- 模块化最彻底，按 BUILD/BUILD.bazel 切
- 根用 `root-bazel.md.tmpl`，子包用 `pkg-bazel.md.tmpl`

### iOS / Android
- 单一 target 不算 monorepo
- 多 target / 多 module 时按 target 拆
