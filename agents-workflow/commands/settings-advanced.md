---
name: settings-advanced
description: 高级设置
skill: writing-plans
trigger: /settings-advanced
category: 设置类
---

## /settings-advanced 命令

### 用法
/settings-advanced [设置项]

### 参数
- `--list`: 列出高级设置
- `--get`: 获取设置值
- `--set`: 设置新值
- `--export`: 导出设置

### 行为
1. 显示高级设置选项
2. 修改高级配置
3. 验证配置有效性
4. 保存配置变更
5. 重启相关服务

### 示例
```
/settings-advanced --list --export settings.json
```

### 输出
高级设置状态和配置文件
