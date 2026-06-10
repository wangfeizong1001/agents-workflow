---
name: verify-phase
description: 验证阶段
skill: verification-before-completion
trigger: /verify-phase
category: 计划类
---

## /verify-phase 命令

### 用法
/verify-phase [阶段名称]

### 参数
- `--criteria`: 验证标准文件路径
- `--strict`: 严格模式验证
- `--fix`: 自动修复发现的问题

### 行为
1. 加载阶段完成标准
2. 运行所有相关测试
3. 检查代码质量指标
4. 验证功能完整性
5. 生成验证报告

### 示例
```
/verify-phase feature-auth --strict --fix
```

### 输出
验证报告，包含通过/失败状态和修复建议
