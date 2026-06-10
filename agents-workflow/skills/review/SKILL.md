---
name: review
description: 预合并代码审查：SQL 安全、LLM 边界、条件副作用
category: 质量保障类
allowed-tools: [Bash, Read, Write, Edit]
---

## review

### 用途
预着陆 PR 审查。分析 diff 与基础分支的差异，检查 SQL 安全性、LLM 信任边界违规、条件副作用以及其他结构性问题。在用户即将合并或着陆代码变更时主动建议。

### 使用方式
1. 获取 PR diff 内容
2. 分析代码变更的安全性
3. 检查 SQL 注入风险
4. 验证 LLM 信任边界
5. 识别条件副作用
6. 输出审查报告

### 输入
- PR diff 或分支比较
- 可选：审查重点（安全/性能/架构）

### 输出
- 审查报告
- 问题分类（Critical/High/Medium/Low）
- 修复建议
- 可选的 approval/request changes

### 示例
```markdown
## PR #123 审查报告

### SQL 安全
- ⚠️ 第 45 行: 动态 SQL 拼接，建议使用参数化查询

### LLM 信任边界
- ❌ 第 78 行: 用户输入直接传递给 LLM，缺少 sanitization

### 条件副作用
- ⚠️ 第 102 行: 函数在特定条件下修改全局状态

### 建议
1. 使用 PreparedStatement 替代字符串拼接
2. 添加 input validation 中间件
```
