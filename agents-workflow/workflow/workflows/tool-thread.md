---
name: 工具线程
description: 工具类并发线程管理
stages: [规划, 执行, 同步]
estimated-time: 10分钟
category: 工具类
---

## 工具线程

> **触发条件**：需要管理工具并发任务时使用
> **预计耗时**：10分钟
> **产出物**：并发任务结果

### 阶段 1：规划（3分钟）

- ② dispatching-parallel-agents → 规划并行任务
- 门禁：任务已规划

### 阶段 2：执行（5分钟）

- ② subagent-driven-development → 执行并发任务
- 门禁：任务已执行

### 阶段 3：同步（2分钟）

- ② verify-change → 同步结果
- 门禁：结果已同步

### 回滚方案
- 撤销并发任务结果