---
name: unfreeze
description: 解除编辑限制
category: 上下文类
allowed-tools: [Bash, Read, Write, Edit]
---

## unfreeze

### 用途
清除 /freeze 设置的编辑边界，恢复对所有目录的编辑权限。当你想在不结束会话的前提下扩大编辑范围时使用。

### 使用方式
1. 检查当前 freeze 状态
2. 解除目录限制
3. 验证限制已解除
4. 继续全范围编辑

### 输入
- 无（或可选：特定 freeze 会话 ID）

### 输出
- 解除确认
- 恢复的编辑权限

### 示例
```markdown
## Unfreeze 操作

### 当前状态
- freeze: 启用
- 限制路径: src/components/

### 解除
unfreeze

### 验证
- ✅ 可以编辑 src/utils/helpers.ts
- ✅ 可以编辑 package.json
- ✅ 全部目录可访问
```
