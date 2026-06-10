---
name: secure-phase
description: 安全阶段
skill: cso
trigger: /secure-phase
category: 计划类
---

## /secure-phase 命令

### 用法
/secure-phase [范围]

### 参数
- `--level`: 安全级别（basic/advanced/comprehensive）
- `--scan`: 扫描类型（vulnerability/compliance/both）
- `--fix`: 自动修复

### 行为
1. 执行安全扫描
2. 识别安全漏洞
3. 评估风险等级
4. 生成修复建议
5. 应用安全补丁

### 示例
```
/secure-phase api-endpoints --level advanced --fix
```

### 输出
安全报告和修复后的代码
