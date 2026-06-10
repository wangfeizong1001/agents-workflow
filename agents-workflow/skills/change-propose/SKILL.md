---
name: change-propose
description: 一步提出变更：设计 + spec + tasks
category: 变更管理类
allowed-tools: [Bash, Read, Write, Edit]
---

## change-propose

### 用途
一步到位地提出一个新 change，并生成所有 artifact。当用户希望快速描述自己想构建什么，并拿到带设计、specs 与 tasks 的完整 proposal 以便立即实施时使用。

### 使用方式
1. 收集用户变更意图
2. 分析现有代码上下文
3. 生成设计文档
4. 编写 delta spec
5. 分解任务列表
6. 输出完整 proposal

### 输入
- 变更描述
- 相关文件或模块
- 可选：设计约束

### 输出
- design.md（设计文档）
- spec.md（delta spec）
- tasks.md（任务列表）
- 实施计划

### 示例
```markdown
## Change Proposal: 添加用户头像上传

### 设计
- 支持 JPG/PNG 格式
- 最大 5MB
- 自动生成缩略图

### Spec
- POST /api/users/avatar
- 返回 { url: string }
- 验证文件类型和大小

### Tasks
1. 创建文件上传中间件
2. 实现图片处理管道
3. 添加 CDN 集成
4. 编写 API 端点
```
