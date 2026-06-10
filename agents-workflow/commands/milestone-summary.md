---
name: milestone-summary
description: 里程碑总结
skill: retro
trigger: /milestone-summary
category: 项目类
---

## /milestone-summary 命令

### 用法
/milestone-summary [里程碑名称]

### 参数
- `--format`: 输出格式（markdown/html）
- `--include`: 包含内容（metrics/learnings/next）
- `--audience`: 目标受众

### 行为
1. 收集里程碑数据
2. 分析完成情况
3. 总结关键成就
4. 识别经验教训
5. 生成总结报告

### 示例
```
/milestone-summary v1.0-release --format markdown --include metrics,learnings
```

### 输出
里程碑总结报告
