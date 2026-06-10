---
name: spec
description: 模糊意图 → 可执行规范 → GitHub Issue
category: 规范计划类
allowed-tools: [Bash, Read, Write, Edit]
---

## spec

### 用途
通过五个阶段将模糊的意图转化为精确、可执行的规范。提交 issue、可选择在全新 worktree 中启动 Claude Code agent，并让 /ship 在合并时关闭源 issue。

### 使用方式
1. 收集用户意图
2. 追问澄清问题
3. 生成结构化规范
4. 创建 GitHub Issue
5. 可选：启动隔离 agent

### 输入
- 模糊的功能描述或需求
- 可选：相关上下文链接

### 输出
- GitHub Issue（含验收标准）
- 结构化规范文档
- 可选：worktree + agent 启动

### 示例
```markdown
## Issue #45: 用户认证系统

### 描述
实现基于 JWT 的用户认证系统

### 验收标准
- [ ] 用户可以通过邮箱/密码注册
- [ ] 用户可以登录并获取 JWT token
- [ ] Token 过期后自动刷新
- [ ] 未授权请求返回 401

### 技术规范
- 使用 bcrypt 哈希密码
- JWT 过期时间: 24 小时
- 刷新 token 过期时间: 7 天

### 估算
- 3 个开发日
```
