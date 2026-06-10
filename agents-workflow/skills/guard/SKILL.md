---
name: guard
description: 完整安全模式：破坏性命令警告 + 编辑限制
category: 安全类
allowed-tools: [Bash, Read, Write, Edit]
---

## guard

### 用途
完整的安全模式：破坏性命令警告 + 目录范围内的编辑限制。把 /careful 与 /freeze 合二为一。在操作生产或调试在线系统时用于获取最高级别的安全保护。

### 使用方式
1. 启用 guard 模式
2. 设置编辑限制目录
3. 激活破坏性命令警告
4. 执行任务
5. 完成后解除

### 输入
- 目标目录路径
- 可选：安全级别（low/medium/high）

### 输出
- guard 状态确认
- 保护措施列表
- 操作日志

### 示例
```markdown
## Guard 模式

### 启用
guard --path src/ --level high

### 保护措施
1. ✅ 编辑限制: src/
2. ✅ 破坏性命令警告: 启用
3. ✅ 强制确认: rm, drop, reset, force-push

### 验证
- ✅ 可以编辑 src/ 内文件
- ❌ 无法编辑 src/ 外文件
- ⚠️ rm -rf 需要确认
```
