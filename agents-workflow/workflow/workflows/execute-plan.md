---
name: 执行计划
description: 按计划执行任务
stages: [准备, 执行, 验证]
estimated-time: 60分钟
category: 执行类
---

## 执行计划

> **触发条件**：有计划需要执行时使用
> **预计耗时**：60分钟
> **产出物**：执行结果

### 阶段 1：准备（10分钟）

- ① context-restore → 恢复上下文
- ② check-todos → 检查待办
- 门禁：上下文已恢复

### 阶段 2：执行（40分钟）

- ① execute-plan → 执行计划
- ② apply-change → 应用变更
- 门禁：任务已完成

### 阶段 3：验证（10分钟）

- ① verification-before-completion → 验证结果
- ② health → 健康检查
- 门禁：验证通过

### 回滚方案
- 使用 git 回滚到执行前状态