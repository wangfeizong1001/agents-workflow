---
name: gstack-openclaw-investigate
description: 调查
category: 其他类
allowed-tools: [Bash, Read, Write, Edit]
---

## gstack-openclaw-investigate

### 用途
Use when asked to debug, fix a bug, investigate an error, or do root cause analysis, and when users report errors, stack traces, unexpected behavior, or say something stopped working.

### 使用方式
1. 收集错误信息
2. 复现问题
3. 分析日志
4. 定位根因
5. 提出修复方案

### 输入
- 错误描述
- 复现步骤
- 日志文件

### 输出
- 根因分析
- 修复方案
- 预防措施

### 示例
```markdown
## 调查报告 - 登录失败

### 现象
用户报告无法登录，返回 500 错误

### 复现
1. 输入正确邮箱
2. 输入正确密码
3. 点击登录
4. 返回 500 错误

### 分析
- 服务器日志: "Database connection refused"
- 原因: 数据库连接池耗尽

### 修复
- 增加连接池大小: 10 → 50
- 添加连接超时: 5s
```
