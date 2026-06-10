---
name: add-phase
description: 添加阶段
skill: writing-plans
trigger: /add-phase
category: 工具类
---

## /add-phase 命令

### 用法
/add-phase [阶段名称]

### 参数
- `--position`: 添加位置
- `--template`: 阶段模板
- `--tasks`: 关联任务

### 行为
1. 定义新阶段
2. 设置阶段属性
3. 关联任务列表
4. 更新项目计划
5. 验证计划完整性

### 示例
```
/add-phase testing --position after:development --template qa
```

### 输出
更新后的项目计划
