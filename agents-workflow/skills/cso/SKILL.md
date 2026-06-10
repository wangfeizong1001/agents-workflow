---
name: cso
description: 安全审计：密钥考古、供应链、CI/CD
category: 审查类
allowed-tools: [Bash, Read, Write, Edit]
---

## cso

### 用途
首席安全官模式。基础设施优先的安全审计：密钥考古、依赖供应链、CI/CD 流水线安全、LLM/AI 安全、技能供应链扫描，加 OWASP Top 10、STRIDE 威胁建模与主动验证。

### 使用方式
1. 密钥考古：扫描代码中的硬编码密钥
2. 供应链审计：检查依赖漏洞
3. CI/CD 安全：验证流水线配置
4. LLM 安全：检查 AI 集成风险
5. OWASP Top 10 检查
6. 生成安全报告

### 输入
- 代码仓库
- CI/CD 配置
- 依赖清单

### 输出
- 安全审计报告
- 漏洞清单
- 风险等级
- 修复建议

### 示例
```markdown
## 安全审计报告

### 密钥考古
- ⚠️ 发现 AWS 密钥在 config.js:42
- ❌ 数据库密码硬编码在 .env.example

### 供应链
- ⚠️ lodash@4.17.15 有已知漏洞
- 建议: 升级到 4.17.21

### OWASP Top 10
- A01: 访问控制 ✅
- A02: 加密失败 ⚠️
- A03: 注入 ✅
```
