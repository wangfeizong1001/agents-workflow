---
name: pair-agent
description: 远程 agent 浏览器配对共享
category: 集成类
allowed-tools: [Bash, Read, Write, Edit]
---

## pair-agent

### 用途
将远程 AI agent 与你的浏览器配对。一条命令生成一个 setup key 并打印另一个 agent 可遵循以连接的指令。兼容 OpenClaw、Hermes、Codex、Cursor 或任何能发起 HTTP 请求的 agent。

### 使用方式
1. 生成配对 key
2. 打印连接指令
3. 远程 agent 连接
4. 共享浏览器访问
5. 监控会话

### 输入
- 无（或可选：访问权限级别）

### 输出
- 配对 key
- 连接指令
- 会话状态

### 示例
```markdown
## 浏览器配对

### 配对 Key
`pair-abc123-def456-ghi789`

### 连接指令
1. 安装 agent CLI
2. 运行: `agent connect --key pair-abc123-def456-ghi789`
3. 浏览器将打开共享会话

### 权限
- 默认: 读+写
- 可选: 管理员权限

### 状态
- 远程 agent: 已连接
- 共享标签页: 1
```
