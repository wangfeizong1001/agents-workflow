---
name: PR 分支
description: 创建和管理 PR 分支
stages: [创建, 推送, 创建 PR]
estimated-time: 10分钟
category: 管理类
---

## PR 分支

> **触发条件**：需要创建 PR 分支时使用
> **预计耗时**：10分钟
> **产出物**：PR 分支和 PR

### 阶段 1：创建（3分钟）

- ① git-branch → 创建分支
- ② git-checkout → 切换分支
- 门禁：分支已创建

### 阶段 2：推送（4分钟）

- ② git-push → 推送分支
- 门禁：分支已推送

### 阶段 3：创建 PR（3分钟）

- ② github-create-pull-request → 创建 PR
- 门禁：PR 已创建

### 回滚方案
- 删除分支和 PR