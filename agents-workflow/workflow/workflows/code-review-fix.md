---
name: 代码审查修复
description: 修复代码审查中发现的问题
stages: [分析, 修复, 验证]
estimated-time: 30分钟
category: 质量类
---

## 代码审查修复

> **触发条件**：代码审查发现问题需要修复时使用
> **预计耗时**：30分钟
> **产出物**：修复后的代码

### 阶段 1：分析（8分钟）

- ① explore → 分析审查意见
- ② investigate → 调查问题原因
- 门禁：问题已明确

### 阶段 2：修复（15分钟）

- ① apply-change → 应用修复
- ② code-review-fix → 执行修复操作
- 门禁：修复已完成

### 阶段 3：验证（7分钟）

- ① verification-before-completion → 验证修复
- ② health → 检查影响范围
- 门禁：修复验证通过

### 回滚方案
- 撤销修复操作