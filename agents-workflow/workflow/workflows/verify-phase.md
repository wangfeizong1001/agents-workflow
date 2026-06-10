---
name: 验证阶段
description: 验证阶段完成质量和正确性
stages: [检查, 测试, 确认]
estimated-time: 20分钟
category: 阶段类
---

## 验证阶段

> **触发条件**：阶段执行完成后需要验证时使用
> **预计耗时**：20分钟
> **产出物**：验证报告

### 阶段 1：检查（7分钟）

- ① review → 审查代码变更
- ② code-review → 代码质量检查
- 门禁：代码审查完成

### 阶段 2：测试（8分钟）

- ① qa → 运行 QA 测试
- ② health → 健康检查
- 门禁：所有测试通过

### 阶段 3：确认（5分钟）

- ① verify-change → 确认变更正确
- ② verification-before-completion → 最终验证
- 门禁：验证报告已生成

### 回滚方案
- 根据验证结果修复问题