---
name: using-git-worktrees
description: 隔离工作区并行开发
category: 开发方法类
allowed-tools: [Bash, Read, Write, Edit]
---

## using-git-worktrees

### 用途
当需要开始与当前工作区隔离的功能开发，或在执行实现计划之前使用。通过 git worktree 确保隔离工作区存在。

### 使用方式
1. 检查现有 worktree
2. 创建新的 worktree
3. 切换到新工作区
4. 执行开发任务
5. 完成后清理 worktree

### 输入
- 功能分支名称
- 可选：基础分支
- 可选：worktree 路径

### 输出
- 新的 worktree 目录
- 隔离的开发环境
- 分支状态

### 示例
```bash
# 列出现有 worktree
git worktree list

# 创建新 worktree
git worktree add ../feature-user-auth feature/user-auth

# 切换到新工作区
cd ../feature-user-auth

# 开发完成后清理
git worktree remove ../feature-user-auth
```
