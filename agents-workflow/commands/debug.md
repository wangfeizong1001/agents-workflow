---
name: debug
description: 调试
skill: investigate
trigger: /debug
category: 调试类
---

## /debug 命令

### 用法
/debug [问题描述]

### 参数
- `--verbose`: 详细日志
- `--breakpoint`: 设置断点
- `--watch`: 监视变量

### 行为
1. 分析问题现象
2. 设置调试环境
3. 执行调试步骤
4. 收集调试信息
5. 定位问题原因

### 示例
```
/debug "登录失败" --verbose --watch userContext
```

### 输出
调试报告，包含问题定位和修复建议
