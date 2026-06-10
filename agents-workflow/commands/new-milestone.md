---
name: new-milestone
description: 新建里程碑
skill: writing-plans
trigger: /new-milestone
category: 项目类
---

## /new-milestone 命令

### 用法
/new-milestone [里程碑名称]

### 参数
- `--due-date`: 截止日期
- `--tasks`: 关联任务
- `--priority`: 优先级

### 行为
1. 定义里程碑目标
2. 设置时间表
3. 关联相关任务
4. 创建里程碑文档
5. 更新项目计划

### 示例
```
/new-milestone v1.0-release --due-date 2024-03-01 --priority high
```

### 输出
里程碑文档和更新后的项目计划
