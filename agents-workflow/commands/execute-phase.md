---
name: execute-phase
description: 执行阶段
skill: apply-change
trigger: /execute-phase
category: 计划类
---

## /execute-phase 命令

### 用法
/execute-phase [阶段名称]

### 参数
- `--dry-run`: 模拟执行，不实际修改文件
- `--parallel`: 启用并行任务执行
- `--stop-on-error`: 遇到错误时停止

### 行为
1. 加载阶段计划
2. 按依赖顺序执行任务
3. 记录执行日志和进度
4. 处理执行过程中的错误
5. 更新任务状态

### 示例
```
/execute-phase feature-auth --parallel
```

### 输出
执行进度报告和更新后的任务状态
