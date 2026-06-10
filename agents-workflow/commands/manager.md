---
name: manager
description: 管理器
skill: writing-plans
trigger: /manager
category: 工具类
---

## /manager 命令

### 用法
/manager [管理操作]

### 参数
- `--list`: 列出所有资源
- `--status`: 显示状态
- `--cleanup`: 清理资源
- `--optimize`: 优化配置

### 行为
1. 扫描管理资源
2. 分析资源状态
3. 识别优化机会
4. 执行管理操作
5. 生成管理报告

### 示例
```
/manager --status
/manager --cleanup --optimize
```

### 输出
资源状态报告和优化建议
