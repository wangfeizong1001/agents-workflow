---
name: settings-integrations
description: 集成设置
skill: writing-plans
trigger: /settings-integrations
category: 设置类
---

## /settings-integrations 命令

### 用法
/settings-integrations [集成服务]

### 参数
- `--list`: 列出集成
- `--add`: 添加集成
- `--remove`: 移除集成
- `--test`: 测试连接

### 行为
1. 显示可用集成
2. 配置集成参数
3. 测试集成连接
4. 保存集成设置
5. 激活集成服务

### 示例
```
/settings-integrations --list
/settings-integrations --add github --test
```

### 输出
集成配置状态和测试结果
