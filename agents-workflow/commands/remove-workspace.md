---
name: remove-workspace
description: 移除工作区
skill: apply-change
trigger: /remove-workspace
category: 变更类
---

## /remove-workspace 命令

### 用法
/remove-workspace [工作区名称]

### 参数
- `--force`: 强制移除
- `--archive`: 归档工作区
- `--clean`: 清理相关文件

### 行为
1. 检查工作区状态
2. 备份重要数据
3. 移除工作区文件
4. 清理相关配置
5. 更新工作区列表

### 示例
```
/remove-workspace feature-branch --archive
```

### 输出
工作区移除确认和清理报告
