---
name: forensics
description: 取证分析
skill: investigate
trigger: /forensics
category: 调试类
---

## /forensics 命令

### 用法
/forensics [事件]

### 参数
- `--time-range`: 时间范围
- `--scope`: 分析范围
- `--preserve`: 保存证据

### 行为
1. 保存现场状态
2. 收集相关证据
3. 分析事件时间线
4. 识别根本原因
5. 生成取证报告

### 示例
```
/forensics "生产事故" --time-range "2024-01-01 to 2024-01-02" --preserve
```

### 输出
取证分析报告，包含事件时间线和根本原因
