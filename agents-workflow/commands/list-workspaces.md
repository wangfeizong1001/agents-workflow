---
name: list-workspaces
description: 列出工作区
skill: using-git-worktrees
trigger: /list-workspaces
category: 变更类
---

## /list-workspaces 命令

### 用法
/list-workspaces [筛选条件]

### 参数
- `--all`: 显示所有工作区
- `--active`: 仅活动工作区
- `--status`: 显示状态信息
- `--format`: 输出格式

### 行为
1. 扫描所有工作区
2. 收集工作区信息
3. 分类筛选
4. 显示状态详情
5. 生成列表报告

### 示例
```
/list-workspaces --active --status
```

### 输出
工作区列表，包含状态和路径信息
