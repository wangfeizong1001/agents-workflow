---
name: finishing-development-branch
description: 开发完成后的集成决策
category: 开发方法类
allowed-tools: [Bash, Read, Write, Edit]
---

## finishing-development-branch

### 用途
当实现完成、所有测试通过、需要决定如何集成工作时使用。通过提供合并、PR 或清理等结构化选项来引导开发工作的收尾。

### 使用方式
1. 验证所有测试通过
2. 检查代码质量
3. 评估集成选项
4. 执行选定的选项
5. 清理工作区

### 输入
- 当前分支状态
- 测试结果
- 代码质量报告

### 输出
- 集成选项评估
- 执行结果
- 清理报告

### 示例
```markdown
## 集成决策

### 状态
- 测试: ✅ 全部通过
- Lint: ✅ 无警告
- 覆盖率: 85%

### 选项
1. **合并到 main**: 适合小改动
2. **创建 PR**: 适合需要审查的改动
3. **Cherry-pick**: 适合部分功能

### 推荐
创建 PR 进行代码审查

### 执行
gh pr create --title "feat: 用户认证" --body "实现 JWT 认证"
```
