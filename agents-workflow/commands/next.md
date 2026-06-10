---
name: next
description: 下一个
skill: apply-change
trigger: /next
category: 工作流类
---

## /next 命令

### 用法
/next [任务类型]

### 参数
- `--priority`: 优先级筛选
- `--estimated`: 预估时间
- `--context`: 上下文信息

### 行为
1. 分析待办任务
2. 按优先级排序
3. 推荐下一个任务
4. 提供任务详情
5. 准备执行环境

### 示例
```
/next --priority high --estimated 30min
```

### 输出
推荐任务和执行准备
