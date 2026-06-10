---
name: audit-milestone
description: 审计里程碑
skill: review
trigger: /audit-milestone
category: 项目类
---

## /audit-milestone 命令

### 用法
/audit-milestone [里程碑名称]

### 参数
- `--scope`: 审计范围
- `--criteria`: 审计标准
- `--evidence`: 证据收集

### 行为
1. 定义审计标准
2. 收集审计证据
3. 评估完成质量
4. 识别改进机会
5. 生成审计报告

### 示例
```
/audit-milestone v1.0-release --scope code --criteria quality,security
```

### 输出
里程碑审计报告
