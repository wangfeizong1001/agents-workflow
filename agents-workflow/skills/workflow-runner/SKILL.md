---
name: workflow-runner
description: 当前 LLM 内直接运行 YAML 工作流
category: 开发方法类
allowed-tools: [Bash, Read, Write, Edit]
---

## workflow-runner

### 用途
在 Claude Code / OpenClaw / Cursor 中直接运行 agency-orchestrator YAML 工作流——无需 API key，使用当前会话的 LLM 作为执行引擎。

### 使用方式
1. 读取 YAML 工作流文件
2. 解析工作流步骤
3. 按顺序执行每个步骤
4. 使用当前 LLM 作为执行引擎
5. 输出执行结果

### 输入
- YAML 工作流文件
- 输入参数
- 可选：执行选项

### 输出
- 执行日志
- 每步结果
- 最终输出

### 示例
```yaml
# workflow.yaml
name: 代码审查工作流
steps:
  - name: 读取代码
    action: read
    path: src/main.ts
  
  - name: 分析代码
    action: analyze
    type: security
  
  - name: 生成报告
    action: write
    path: report.md
```

```bash
# 执行工作流
workflow-runner --input workflow.yaml
```
