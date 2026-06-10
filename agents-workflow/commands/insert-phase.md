---
name: insert-phase
description: 插入阶段
skill: writing-plans
trigger: /insert-phase
category: 计划类
---

## /insert-phase 命令

### 用法
/insert-phase [阶段名称] --after [目标阶段]

### 参数
- `--after`: 在指定阶段后插入
- `--before`: 在指定阶段前插入
- `--template`: 使用阶段模板

### 行为
1. 分析现有阶段结构
2. 计算插入位置影响
3. 创建新阶段计划
4. 调整依赖关系
5. 更新项目计划

### 示例
```
/insert-phase testing-phase --after feature-auth
```

### 输出
更新后的项目计划，包含新插入的阶段
