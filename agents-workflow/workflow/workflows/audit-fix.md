---
name: 审计修复
description: 修复审计中发现的问题
stages: [分析, 修复, 验证]
estimated-time: 25分钟
category: 质量类
---

## 审计修复

> **触发条件**：审计发现问题需要修复时使用
> **预计耗时**：25分钟
> **产出物**：修复后的代码

### 阶段 1：分析（7分钟）

- ① explore → 分析审计报告
- ② investigate → 调查问题根源
- 门禁：问题已明确

### 阶段 2：修复（12分钟）

- ① apply-change → 应用修复方案
- ② audit-fix → 执行审计修复
- 门禁：修复已完成

### 阶段 3：验证（6分钟）

- ① verification-before-completion → 验证修复
- ② health → 健康检查
- 门禁：修复验证通过

### 回滚方案
- 撤销修复操作