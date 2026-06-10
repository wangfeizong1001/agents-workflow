---
name: 安全阶段
description: 安全审计和加固
stages: [审计, 加固, 验证]
estimated-time: 40分钟
category: 阶段类
---

## 安全阶段

> **触发条件**：需要进行安全审计时使用
> **预计耗时**：40分钟
> **产出物**：安全审计报告

### 阶段 1：审计（15分钟）

- ① cso → 安全审计
- ② review → 审查安全相关代码
- 门禁：安全问题已识别

### 阶段 2：加固（15分钟）

- ① apply-change → 应用安全修复
- ② code-review-fix → 修复安全问题
- 门禁：安全问题已修复

### 阶段 3：验证（10分钟）

- ① verification-before-completion → 验证修复
- ② health → 健康检查
- 门禁：安全验证通过

### 回滚方案
- 回滚安全修复