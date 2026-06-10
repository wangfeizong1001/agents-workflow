# 反模式详解

## R1. 根文件做字典

**症状**：根 `CLAUDE.md` 详尽列出所有包的约定、命令、注意事项。

```markdown
# ❌ 反模式
## API 约定
- handler 返回 Result<T, E>
- 用 Zod 校验
- 错误用 ApiError

## Web 约定
- Tailwind v4
- 禁止 default export
- 状态用 Zustand
```

**正确**：根文件只放跨领域的"指针"，约定下沉到子目录。

```markdown
# ✅ 正确
## 子目录索引
- apps/api/ — 见 apps/api/CLAUDE.md
- apps/web/ — 见 apps/web/CLAUDE.md
```

## R2. 条件句留在根

**症状**：
```markdown
## 约定
- 如果你在 api/handlers/，handler 必须返回 Result<T, E>
- 如果你在 web/，禁止 default export
```

**正确**：条件句本身就是子目录 CLAUDE.md 的雏形。把内容搬到对应子目录。

## R3. 子目录文件照搬根

**症状**：子目录 `CLAUDE.md` 又写一遍"我们用 TypeScript strict"、"提交前跑 lint"。

**正确**：这些是全局约定，只在根写一次。子目录文件假设根文件已被加载。

## R4. 拆过头

**症状**：
```
src/CLAUDE.md
src/components/CLAUDE.md
src/components/Button/CLAUDE.md
src/components/Button/Button.tsx
```

**正确**：第三层几乎不需要。除非 `Button` 是个独立包或有独立构建。

## R5. CLAUDE.md 当 README 用

**症状**：
```markdown
## 概述
本项目是 XXX，由 YYY 公司开发，详见 README.md
```

**正确**：CLAUDE.md 给 Claude 看，**不是给人看的项目介绍**。聚焦于"Claude 在这个目录下工作时必须知道什么"。

## R6. 命令分散在根和子目录

**症状**：
```markdown
# 根
## 命令
- pnpm test  ← 跑全量

# 子目录 apps/api/CLAUDE.md
## 命令
- pnpm --filter @app/api test  ← 跑切片
```

**正确**：根不写具体的 test/lint 命令（除非要跑全量），命令放子目录。

## R7. 跨包依赖散落

**症状**：子目录文件里写"改 shared types 时先 X"，但 X 命令取决于 monorepo 工具。

**正确**：跨包说明放**根**或专门的 `packages/shared/CLAUDE.md`，子目录不重复。

## R8. .claude/rules/ 滥写

**症状**：
```yaml
# rules/formatting.md
paths: ["**/*.ts"]
content: |
  - 用双引号
  - 缩进 2 空格
  - 末尾分号
```

**正确**：这些应该用 ESLint/Prettier/Biome 强制，不是 Claude 提示。`.claude/rules/` 只写**工具无法表达的**约定（如"先 X 再 Y"的协作流程）。

## R9. 路径谓词与目录 CLAUDE.md 重复

**症状**：`apps/web/CLAUDE.md` 写"组件用 named export"，`rules/tsx-components.md` 也写"禁止 default export"。

**正确**：
- 目录 CLAUDE.md：放**目录级别**约定（如"前端用 Zustand 而非 Redux"）
- 路径规则：放**文件模式**约定（如"所有 .tsx 必须有 props 类型"）

## R10. 删了旧文件忘提交规则变更

**症状**：拆分时改了 `package.json` 的 scripts 命名，根 CLAUDE.md 改了但子目录忘了同步。

**正确**：每次拆分都是一个 PR，必须跑过 `check-commands.sh`。

## R11. 跟 AGENTS.md 抢戏

**症状**：同时存在 `AGENTS.md`（OpenCode/Codex 风格）和 `CLAUDE.md`（Claude Code 风格），内容不一致。

**正确**：二选一。OpenCode/Codex 用户用 `AGENTS.md`，Claude Code 用户用 `CLAUDE.md`。本 skill 会检测到 `AGENTS.md` 存在时自动切换。

## R12. 模板未参数化

**症状**：
```bash
cp templates/pkg-pnpm.md.tmpl apps/api/CLAUDE.md
# 然后用编辑器手工改 PKG_NAME、COMMAND 等
```

**正确**：用 `render-template.sh` 渲染，避免手工改漏字段、错格式。
