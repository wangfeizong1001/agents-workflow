---
name: remove-phase
description: 移除阶段
skill: apply-change
trigger: /remove-phase
category: 计划类
---

## /remove-phase 命令

### 用法
/remove-phase [阶段名称]

### 参数
- `--force`: 强制移除，不检查依赖
- `--archive`: 归档而非删除
- `--cascade`: 级联移除依赖阶段

### 行为
1. 检查阶段依赖关系
2. 验证移除安全性
3. 执行移除或归档操作
4. 更新项目计划
5. 清理相关资源

### 示例
```
/remove-phase legacy-module --archive
```

### 输出
移除确认和更新后的项目计划
