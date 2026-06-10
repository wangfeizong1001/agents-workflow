---
name: validate-phase
description: 验证阶段
skill: verification-before-completion
trigger: /validate-phase
category: 计划类
---

## /validate-phase 命令

### 用法
/validate-phase [验证对象]

### 参数
- `--type`: 验证类型（functional/performance/security）
- `--criteria`: 验证标准
- `--report`: 报告格式

### 行为
1. 定义验证标准
2. 执行验证测试
3. 收集验证数据
4. 分析验证结果
5. 生成验证报告

### 示例
```
/validate-phase api-endpoints --type performance
```

### 输出
验证报告，包含验证结果和改进建议
