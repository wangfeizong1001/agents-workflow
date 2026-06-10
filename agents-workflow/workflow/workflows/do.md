---
name: 执行
description: 立即执行当前任务
stages: [准备, 执行, 确认]
estimated-time: 30分钟
category: 执行类
---

## 执行

> **触发条件**：需要立即执行任务时使用
> **预计耗时**：30分钟
> **产出物**：任务完成

### 阶段 1：准备（5分钟）

- ① context-restore → 恢复上下文
- ② next → 确定下一个任务
- 门禁：任务已确定

### 阶段 2：执行（20分钟）

- ① do → 执行任务
- ② apply-change → 应用变更
- 门禁：任务已完成

### 阶段 3：确认（5分钟）

- ① verification-before-completion → 验证结果
- ② progress → 更新进度
- 门禁：任务已确认完成

### 回滚方案
- 撤销执行结果