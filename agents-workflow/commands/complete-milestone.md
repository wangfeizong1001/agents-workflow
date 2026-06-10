---
name: complete-milestone
description: 完成里程碑
skill: verification-before-completion
trigger: /complete-milestone
category: 项目类
---

## /complete-milestone 命令

### 用法
/complete-milestone [里程碑名称]

### 参数
- `--verify`: 验证完成标准
- `--summary`: 生成总结
- `--archive`: 归档里程碑

### 行为
1. 验证里程碑完成标准
2. 收集完成证据
3. 生成完成报告
4. 更新项目状态
5. 归档里程碑文档

### 示例
```
/complete-milestone v1.0-release --verify --summary
```

### 输出
里程碑完成报告和更新后的项目状态
