---
name: PR 助手
description: Pull Request 操作辅助
stages: [创建, 审查, 合并]
estimated-time: 15分钟
category: 工具类
---

## PR 助手

> **触发条件**：需要 PR 操作辅助时使用
> **预计耗时**：15分钟
> **产出物**：PR 操作结果

### 阶段 1：创建（5分钟）

- ② github-create-pull-request → 创建 PR
- 门禁：PR 已创建

### 阶段 2：审查（5分钟）

- ② review → 审查 PR
- 门禁：审查完成

### 阶段 3：合并（5分钟）

- ② github-merge-pull-request → 合并 PR
- 门禁：PR 已合并

### 回滚方案
- 关闭 PR 并回滚合并