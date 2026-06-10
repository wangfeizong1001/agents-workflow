---
name: security-audit
description: 安全审计
skill: cso
trigger: /security-audit
category: 审查类
---

## /security-audit 命令

### 用法
/security-audit [范围]

### 参数
- `--type`: 审计类型（code/infrastructure/compliance）
- `--depth`: 审计深度
- `--standard`: 审计标准（OWASP/ISO/SOC2）

### 行为
1. 收集安全信息
2. 执行安全扫描
3. 分析漏洞风险
4. 评估合规性
5. 生成审计报告

### 示例
```
/security-audit application --type code --standard OWASP
```

### 输出
安全审计报告，包含漏洞列表和修复建议
