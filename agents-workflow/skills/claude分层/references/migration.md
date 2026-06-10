# 迁移指南：从单根 CLAUDE.md 拆到分层

适用场景：仓库里已有根 `CLAUDE.md`，且行数 > 80 或包含条件句。

## 流程

### 第 1 步：自动盘点
```bash
bash <skill-dir>/scripts/analyze-existing-claude-md.sh .
```
读取输出，识别：
- 根文件行数
- 是否含"如果你在 X 目录"条件句
- 包专属命令的归位

### 第 2 步：手工切片

打开 `CLAUDE.md`，按下面的规则把每段内容归到三处之一：

| 内容类型 | 归处 | 例子 |
|---|---|---|
| 跨领域规则 | 根 | 分支保护、提交格式、PR 流程 |
| 包专属命令 | 子包 | `pnpm --filter @app/api test` |
| 包专属约定 | 子包 | "handler 必须返回 Result<T, E>" |
| 条件句覆盖的子目录 | 那个子目录 | "如果你在 api/handlers 下，X" |
| 跨包依赖说明 | 根 | "改 shared types 先跑 `pnpm build:types`" |

### 第 3 步：建立子目录文件

在每个被识别的子目录下创建 `CLAUDE.md`，从 `templates/pkg-*.md.tmpl` 选对应模板。

### 第 4 步：精简根文件

目标：根 ≤ 80 行。通常保留：
- 技术栈概览
- 全局命令别名
- 分支/提交规则
- 子目录索引（一行一条）
- 跨包依赖说明

### 第 5 步：验证

```bash
bash <skill-dir>/scripts/check-line-budget.sh .
bash <skill-dir>/scripts/check-overlap.sh .
bash <skill-dir>/scripts/check-commands.sh .
```

### 第 6 步：清理

确认无误后：
```bash
rm CLAUDE.md.bak
git add -A
git commit -m "分层: 拆分 CLAUDE.md 为根 + 子目录分层"
```

## 案例：从 400 行单根文件拆为 5 个子目录

**之前**：
```
repo/CLAUDE.md  (400 行)
├─ ## 概览
├─ ## API 约定           ← 应拆到 apps/api/CLAUDE.md
├─ ## React 组件约定     ← 应拆到 apps/web/CLAUDE.md
├─ ## Terraform 约定     ← 应拆到 infra/CLAUDE.md
├─ ## 测试命令
├─ ## 部署
└─ ## 提交规则
```

**之后**：
```
repo/CLAUDE.md                  (60 行：栈、命令、索引、提交)
repo/apps/api/CLAUDE.md         (40 行：API 约定 + API 命令)
repo/apps/web/CLAUDE.md         (35 行：React 约定 + 前端命令)
repo/infra/CLAUDE.md            (25 行：Terraform 约定 + 部署命令)
repo/.claude/rules/db-migrations.md  (迁移规则)
```

## 渐进式迁移（团队大、风险敏感）

不要一次性提交全部 5 个新文件。顺序：

1. **第 1 周**：在最大那个包下加 `CLAUDE.md`，根文件不动。让团队试用。
2. **第 2 周**：再拆第二个包。同步精简根文件对应段落。
3. **第 3 周起**：每 1-2 周拆一个包，根文件逐步瘦身。
4. **季度末**：根文件目标 ≤ 50 行，启用 `.claude/rules/` 做路径谓词。

**好处**：每次改动小，git diff 易 review，团队有时间适应。

## 团队协作约定

迁移到分层后，文档里明确：

- **根文件 owner**：tech lead 或轮流值班
- **子目录文件 owner**：该包/模块的负责人
- **新增子目录 CLAUDE.md 的标准**：
  - 子目录有 ≥ 3 个文件
  - 子目录有该目录专属的命令或约定
  - 与上级 CLAUDE.md 不重叠
  - 评审时由根文件 owner approve
- **子目录文件 ≤ 10 行 → 合并到上级**

## 回滚方案

如果发现拆分后 Claude 行为变差：

1. `git revert` 整次拆分 commit
2. 找原因（通常是某子目录文件漏了关键规则）
3. 修补该子目录文件，重新应用拆分

**不要**直接回滚到单文件然后放弃分层。先定位丢失的规则。
