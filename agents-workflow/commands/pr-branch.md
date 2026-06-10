---
name: pr-branch
description: PR 分支
skill: ship
trigger: /pr-branch
category: 变更类
---

## /pr-branch 命令

### 用法
/pr-branch [分支名称]

### 参数
- `--create`: 创建新分支
- `--push`: 推送到远程
- `--pr`: 创建 PR

### 行为
1. 检查当前状态
2. 创建功能分支
3. 推送到远程
4. 创建 Pull Request
5. 更新工作区

### 示例
```
/pr-branch feature/new-api --create --push --pr
```

### 输出
分支创建确认和 PR 链接
