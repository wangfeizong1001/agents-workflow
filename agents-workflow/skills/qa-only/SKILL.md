---
name: qa-only
description: 仅报告型 QA 测试，不修复
category: 质量保障类
allowed-tools: [Bash, Read, Write, Edit]
---

## qa-only

### 用途
系统化测试 Web 应用并产出结构化报告，但绝不修复任何东西。适用于只需要 bug 报告而不需要代码修改的场景。报告包含健康分、截图、复现步骤。

### 使用方式
1. 使用 browse 技能系统化测试站点
2. 记录所有发现的问题
3. 为每个问题提供复现步骤
4. 截图作为证据
5. 生成结构化报告，不修改代码

### 输入
- 目标站点 URL
- 测试范围（全站/特定功能）
- 可选：已知问题的验证列表

### 输出
- 结构化 QA 报告
- 健康分（0-10）
- 每个问题的截图证据
- 复现步骤

### 示例
```markdown
## QA 报告 - Example.com

### 健康分: 7.2/10

### Critical Issues (2)
1. **CSRF Token 缺失**
   - 复现: 访问 /login，查看表单
   - 截图: csrf-missing.png
   - 影响: 安全漏洞

### High Issues (3)
2. **移动端菜单无法关闭**
   - 复现: 移动视口 > 点击菜单 > 点击关闭
   - 截图: mobile-menu-bug.png
```
