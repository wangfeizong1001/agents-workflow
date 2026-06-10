---
name: change-sync-specs
description: delta spec 同步到主 spec
category: 变更管理类
allowed-tools: [Bash, Read, Write, Edit]
---

## change-sync-specs

### 用途
将 change 中的 delta spec 同步到主 spec。当用户希望用 delta spec 中的变更来更新主 spec，但又不归档该 change 时使用本技能。

### 使用方式
1. 读取 delta spec
2. 与主 spec 合并
3. 解决冲突
4. 更新版本号
5. 验证一致性
6. 保存更新后的主 spec

### 输入
- Delta spec 路径
- 主 spec 路径
- 可选：合并策略

### 输出
- 更新后的主 spec
- 变更日志
- 版本号更新

### 示例
```markdown
## 同步 delta spec 到主 spec

### Delta Spec 变更
- 新增: POST /api/users/avatar
- 修改: User 类型添加 avatarUrl 字段

### 合并结果
- specs/users.md 已更新
- 版本号: 1.2.0 → 1.3.0
- 变更日志已添加
```
