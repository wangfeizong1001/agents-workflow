---
name: dispatching-parallel-agents
description: 并行代理调度
category: 开发方法类
allowed-tools: [Bash, Read, Write, Edit]
---

## dispatching-parallel-agents

### 用途
当面对 2 个以上可以独立进行、无共享状态或顺序依赖的任务时使用。调度多个 agent 并行执行以提高效率。

### 使用方式
1. 分析任务列表
2. 识别独立任务
3. 为每个任务分配 agent
4. 并行执行
5. 收集结果
6. 合并输出

### 输入
- 任务列表
- 可选：agent 能力要求
- 可选：资源限制

### 输出
- 各 agent 执行结果
- 合并后的输出
- 执行统计

### 示例
```markdown
## 并行调度

### 任务分解
1. [独立] 实现 API 端点 A
2. [独立] 实现 API 端点 B
3. [独立] 编写测试用例
4. [依赖 1,2,3] 集成测试

### 调度
- Agent 1 → 任务 1
- Agent 2 → 任务 2
- Agent 3 → 任务 3
- 等待完成后 → Agent 4 → 任务 4

### 结果
- 总耗时: 8 分钟（串行需 15 分钟）
- 效率提升: 47%
```
