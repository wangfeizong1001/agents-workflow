---
name: add-backlog
description: 添加积压
skill: learn
trigger: /add-backlog
category: 工具类
---

## /add-backlog 命令

### 用法
/add-backlog [积压项]

### 参数
- `--priority`: 优先级
- `--category`: 分类
- `--estimate`: 预估工作量
- `--assign`: 分配

### 行为
1. 记录积压项
2. 设置优先级
3. 分类整理
4. 预估工作量
5. 保存到积压列表

### 示例
```
/add-backlog "性能优化" --priority medium --category optimization
```

### 输出
积压项创建确认
