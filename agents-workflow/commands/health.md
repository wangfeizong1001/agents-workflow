---
name: health
description: 健康
skill: health
trigger: /health
category: 日常类
---

## /health 命令

### 用法
/health [检查范围]

### 参数
- `--quick`: 快速检查
- `--full`: 全面检查
- `--fix`: 自动修复

### 行为
1. 执行健康检查
2. 评估代码质量
3. 检查依赖状态
4. 识别潜在问题
5. 生成健康报告

### 示例
```
/health --full --fix
```

### 输出
健康报告，包含质量评分和修复建议
