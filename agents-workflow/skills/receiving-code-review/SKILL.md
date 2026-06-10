---
name: receiving-code-review
description: 接收代码审查反馈
category: 其他类
allowed-tools: [Bash, Read, Write, Edit]
---

## receiving-code-review

### 用途
收到代码审查反馈后、实施建议之前使用，尤其当反馈不明确或技术上有疑问时——需要技术严谨性和验证，而非敷衍附和或盲目执行。

### 使用方式
1. 理解审查反馈
2. 验证反馈的准确性
3. 评估影响范围
4. 决定是否采纳
5. 实施或沟通

### 输入
- 审查反馈
- 相关代码
- 技术规范

### 输出
- 反馈分析
- 决策记录
- 实施计划

### 示例
```markdown
## 反馈处理

### 审查反馈
"这个函数应该使用 Promise 而不是 callback"

### 分析
- 当前实现: callback 风格
- 建议: Promise/async-await
- 影响: 调用方需要更新

### 决策
✅ 采纳
- 理由: 现代化代码风格，提高可读性
- 影响: 需要更新 3 个调用方

### 实施
1. 重构函数为 async/await
2. 更新调用方
3. 运行测试
```
