---
name: subagent-driven-development
description: 子 agent 并行执行独立任务
category: 开发方法类
allowed-tools: [Bash, Read, Write, Edit]
---

## subagent-driven-development

### 用途
当在当前会话中执行包含独立任务的实现计划时使用。通过子 agent 并行处理独立任务，提高开发效率。

### 使用方式
1. 分析任务依赖关系
2. 识别可并行执行的任务
3. 为每个独立任务启动子 agent
4. 监控执行进度
5. 合并结果

### 输入
- 实现计划
- 任务依赖图
- 可选：并行度限制

### 输出
- 各任务执行结果
- 合并后的代码
- 执行报告

### 示例
```markdown
## 并行任务执行

### 可并行任务
- Agent 1: 实现用户注册 API
- Agent 2: 实现用户登录 API
- Agent 3: 编写数据库迁移

### 依赖任务（等待并行完成后）
- Agent 4: 集成认证中间件

### 执行报告
- Agent 1: 完成 (2m 30s)
- Agent 2: 完成 (2m 15s)
- Agent 3: 完成 (1m 45s)
- Agent 4: 完成 (3m 00s)
```
