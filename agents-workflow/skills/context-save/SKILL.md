---
name: context-save
description: 保存工作上下文的 git 状态/决策
category: 上下文类
allowed-tools: [Bash, Read, Write, Edit]
---

## context-save

### 用途
保存工作上下文。捕获 git 状态、已做出的决定和剩余工作，以便任何未来会话都能毫不间断地接续。

### 使用方式
1. 捕获当前 git 状态
2. 记录已做出的决定
3. 列出剩余工作
4. 保存到上下文文件
5. 可选：提交到 git

### 输入
- 当前工作状态
- 决策历史
- 剩余任务

### 输出
- context.json（上下文文件）
- git 状态快照
- 决策日志

### 示例
```json
{
  "timestamp": "2024-01-15T14:30:00Z",
  "git": {
    "branch": "feature/user-auth",
    "status": "clean",
    "lastCommit": "abc123"
  },
  "decisions": [
    "使用 JWT 而非 session",
    "密码使用 bcrypt 哈希"
  ],
  "remaining": [
    "实现 token 刷新",
    "添加单元测试"
  ]
}
```
