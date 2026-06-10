---
name: freeze
description: 将会话编辑限制在目录范围内
category: 上下文类
allowed-tools: [Bash, Read, Write, Edit]
---

## freeze

### 用途
在本次会话内将文件编辑限制在指定目录范围内。任何针对该路径之外文件的 Edit 或 Write 操作都会被阻止。适用于调试时防止误改无关代码。

### 使用方式
1. 指定要限制的目录路径
2. 启用 freeze 模式
3. 验证限制生效
4. 执行开发任务
5. 完成后解除限制

### 输入
- 目标目录路径
- 可选：排除的文件模式

### 输出
- freeze 状态确认
- 受限的操作列表

### 示例
```markdown
## Freeze 模式

### 启用
freeze --path src/components

### 验证
- ✅ 可以编辑 src/components/Button.tsx
- ❌ 无法编辑 src/utils/helpers.ts
- ❌ 无法编辑 package.json

### 状态
当前限制: src/components/
受保护文件: 15 个
```
