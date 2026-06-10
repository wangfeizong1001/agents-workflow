---
name: 节点修复
description: 修复系统节点问题
stages: [诊断, 修复, 验证]
estimated-time: 15分钟
category: 调试类
---

## 节点修复

> **触发条件**：系统节点出现问题时使用
> **预计耗时**：15分钟
> **产出物**：修复后的节点

### 阶段 1：诊断（5分钟）

- ① investigate → 诊断节点问题
- ② health → 检查节点状态
- 门禁：问题已定位

### 阶段 2：修复（7分钟）

- ① node-repair → 执行节点修复
- ② apply-change → 应用修复
- 门禁：修复已完成

### 阶段 3：验证（3分钟）

- ① verification-before-completion → 验证修复
- ② health → 健康检查
- 门禁：节点恢复正常

### 回滚方案
- 回滚到修复前状态