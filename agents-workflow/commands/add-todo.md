---
name: add-todo
description: 添加待办
skill: learn
trigger: /add-todo
category: 日常类
---

## /add-todo 命令

### 用法
/add-todo [待办内容]

### 参数
- `--priority`: 优先级
- `--due`: 截止日期
- `--assign`: 分配给
- `--tag`: 标签

### 行为
1. 解析待办内容
2. 设置优先级
3. 分配截止日期
4. 添加元数据
5. 保存待办事项

### 示例
```
/add-todo "完成 API 文档" --priority high --due 2024-01-15
```

### 输出
待办事项创建确认
