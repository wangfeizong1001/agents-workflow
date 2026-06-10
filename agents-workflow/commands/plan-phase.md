---
name: plan-phase
description: 制定阶段计划
skill: writing-plans
trigger: /plan-phase
category: 计划类
---

## /plan-phase 命令

### 用法
/plan-phase [阶段名称]

### 参数
- `--scope`: 计划范围（feature/project/milestone）
- `--depth`: 计划深度（shallow/detailed）
- `--estimate`: 是否包含时间估算

### 行为
1. 分析当前项目状态和目标
2. 定义阶段的输入和输出
3. 分解任务并创建依赖图
4. 估算资源需求和时间
5. 生成阶段计划文档

### 示例
```
/plan-phase --scope feature --depth detailed --estimate yes
```

### 输出
生成 `phase-plan.md` 文件，包含阶段目标、任务列表、依赖关系和时间表
