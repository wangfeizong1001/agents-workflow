---
name: resume-project
description: 恢复项目
skill: context-restore
trigger: /resume-project
category: 工作流类
---

## /resume-project 命令

### 用法
/resume-project [项目名称]

### 参数
- `--checkpoint`: 检查点标识
- `--context`: 恢复上下文
- `--verify`: 验证恢复

### 行为
1. 加载项目状态
2. 恢复工作上下文
3. 验证恢复完整性
4. 更新项目状态
5. 提供继续指引

### 示例
```
/resume-project my-project --checkpoint latest --verify
```

### 输出
项目恢复报告和继续指引
