---
name: spec-phase
description: 规格阶段
skill: spec
trigger: /spec-phase
category: 计划类
---

## /spec-phase 命令

### 用法
/spec-phase [功能名称]

### 参数
- `--template`: 规格模板类型
- `--interactive`: 交互式规格定义
- `--output`: 输出文件路径

### 行为
1. 收集功能需求
2. 分析技术约束
3. 定义接口规格
4. 编写验收标准
5. 生成规格文档

### 示例
```
/spec-phase user-auth --interactive
```

### 输出
`spec.md` 规格文档，包含需求、设计和验收标准
