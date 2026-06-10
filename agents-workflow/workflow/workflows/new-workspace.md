---
name: 新建工作区
description: 创建新的工作区环境
stages: [准备, 创建, 配置]
estimated-time: 10分钟
category: 项目类
---

## 新建工作区

> **触发条件**：需要创建新的工作区时使用
> **预计耗时**：10分钟
> **产出物**：新的工作区环境

### 阶段 1：准备（3分钟）

- ① list-workspaces → 查看现有工作区
- ② settings → 配置工作区设置
- 门禁：已确定工作区名称和位置

### 阶段 2：创建（4分钟）

- ① new-workspace → 创建工作区目录
- ② using-git-worktrees → 初始化 git 工作区
- 门禁：工作区目录已创建

### 阶段 3：配置（3分钟）

- ① settings-integrations → 配置集成
- ② health → 验证工作区状态
- 门禁：工作区可正常使用

### 回滚方案
- 删除工作区目录