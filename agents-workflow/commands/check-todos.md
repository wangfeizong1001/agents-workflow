---
name: check-todos
description: 检查待办
skill: learn
trigger: /check-todos
category: 日常类
---

## /check-todos 命令

### 用法
/check-todos [范围]

### 参数
- `--all`: 显示所有待办
- `--today`: 今日待办
- `--overdue`: 过期待办
- `--priority`: 按优先级

### 行为
1. 收集待办事项
2. 分类整理
3. 按优先级排序
4. 识别过期待办
5. 生成待办报告

### 示例
```
/check-todos --today --priority high
```

### 输出
待办事项列表和优先级建议
