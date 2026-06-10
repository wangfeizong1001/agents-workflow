---
name: 执行阶段
description: 按计划执行阶段任务
stages: [准备, 执行, 验证]
estimated-time: 60分钟
category: 阶段类
---

## 执行阶段

> **触发条件**：计划已批准需要执行时使用
> **预计耗时**：60分钟
> **产出物**：阶段完成的代码和文档

### 阶段 1：准备（10分钟）

- ① context-restore → 恢复工作上下文
- ② check-todos → 检查待办事项
- 门禁：上下文已恢复

### 阶段 2：执行（40分钟）

- ① execute-phase → 执行主要任务
- ② subagent-driven-development → 并行处理子任务
- 门禁：所有任务完成

### 阶段 3：验证（10分钟）

- ① verification-before-completion → 运行验证
- ② health → 检查项目健康
- 门禁：验证通过

### 回滚方案
- 使用 git 回滚到执行前状态