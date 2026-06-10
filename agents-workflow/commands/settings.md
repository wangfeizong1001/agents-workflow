---
name: settings
description: 设置
skill: writing-plans
trigger: /settings
category: 设置类
---

## /settings 命令

### 用法
/settings [设置项]

### 参数
- `--list`: 列出所有设置
- `--get`: 获取设置值
- `--set`: 设置新值
- `--reset`: 重置为默认

### 行为
1. 显示当前设置
2. 修改设置值
3. 验证设置有效性
4. 保存设置变更
5. 应用新设置

### 示例
```
/settings --list
/settings --set theme dark
```

### 输出
设置状态和变更记录
