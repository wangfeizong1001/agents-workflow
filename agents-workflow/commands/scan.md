---
name: scan
description: 扫描
skill: health
trigger: /scan
category: 调试类
---

## /scan 命令

### 用法
/scan [扫描目标]

### 参数
- `--type`: 扫描类型（security/quality/performance）
- `--depth`: 扫描深度
- `--output`: 输出格式

### 行为
1. 配置扫描参数
2. 执行扫描操作
3. 分析扫描结果
4. 生成扫描报告
5. 提供修复建议

### 示例
```
/scan codebase --type security --depth deep --output detailed
```

### 输出
扫描报告，包含发现的问题和修复建议
