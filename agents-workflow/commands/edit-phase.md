---
name: edit-phase
description: 编辑阶段
skill: apply-change
trigger: /edit-phase
category: 计划类
---

## /edit-phase 命令

### 用法
/edit-phase [阶段名称]

### 参数
- `--task`: 要编辑的任务 ID
- `--add`: 添加新任务
- `--remove`: 移除任务
- `--reorder`: 重新排序任务

### 行为
1. 加载现有阶段计划
2. 根据参数修改任务列表
3. 重新计算依赖关系
4. 更新计划文档
5. 通知相关变更

### 示例
```
/edit-phase feature-auth --task 3 --remove
```

### 输出
更新后的阶段计划文件
