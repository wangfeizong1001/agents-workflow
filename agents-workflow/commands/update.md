---
name: update
description: 更新
skill: upgrade
trigger: /update
category: 工具类
---

## /update 命令

### 用法
/update [更新目标]

### 参数
- `--check`: 仅检查更新
- `--force`: 强制更新
- `--backup`: 更新前备份

### 行为
1. 检查可用更新
2. 下载更新包
3. 备份当前版本
4. 应用更新
5. 验证更新结果

### 示例
```
/update --check
/update --force --backup
```

### 输出
更新状态和版本信息
