---
name: apply-change
description: 按提案逐步实施变更
category: 变更管理类
allowed-tools: [Bash, Read, Write, Edit]
---

## apply-change

### 用途
实施一项 change 中的 task。当用户想要开始实施、继续实施或推进 task 时使用本技能。按照 proposal 中的任务列表逐步执行。

### 使用方式
1. 读取 proposal 中的任务列表
2. 按顺序执行每个任务
3. 每个任务完成后验证
4. 更新任务状态
5. 处理阻塞问题

### 输入
- Proposal 目录路径
- 可选：特定任务编号
- 可选：跳过验证标志

### 输出
- 代码变更
- 任务状态更新
- 测试结果
- 验证报告

### 示例
```bash
# 读取任务列表
cat proposal/tasks.md

# 执行任务
# Task 1: 创建文件上传中间件
- 编写 src/middleware/upload.ts
- 添加单元测试
- 验证: npm test

# Task 2: 实现图片处理管道
- 编写 src/services/image-processor.ts
- 添加单元测试
- 验证: npm test
```
