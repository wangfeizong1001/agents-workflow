---
name: requesting-code-review
description: 请求代码审查
category: 其他类
allowed-tools: [Bash, Read, Write, Edit]
---

## requesting-code-review

### 用途
完成任务、实现重要功能或合并前使用，用于验证工作成果是否符合要求。

### 使用方式
1. 准备审查请求
2. 编写审查说明
3. 标记审查重点
4. 发送请求
5. 跟进反馈

### 输入
- 代码变更
- 变更说明
- 审查重点

### 输出
- 审查请求
- 审查结果
- 反馈处理

### 示例
```markdown
## 代码审查请求

### 变更说明
实现用户认证系统，包括注册、登录、token 管理

### 审查重点
1. 安全性: JWT 实现是否安全
2. 性能: 数据库查询是否优化
3. 错误处理: 异常情况是否完善

### 测试
- 单元测试: ✅ 通过
- 集成测试: ✅ 通过
- 覆盖率: 85%

### 相关文件
- src/auth/register.ts
- src/auth/login.ts
- src/middleware/auth.ts
```
