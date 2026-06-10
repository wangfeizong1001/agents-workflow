---
name: ship
description: 发布
skill: ship
trigger: /ship
category: 工作流类
---

## /ship 命令

### 用法
/ship [版本号]

### 参数
- `--dry-run`: 模拟发布
- `--changelog`: 生成变更日志
- `--tag`: 创建标签

### 行为
1. 检查发布条件
2. 运行测试套件
3. 构建发布包
4. 创建发布标签
5. 推送到远程

### 示例
```
/ship v1.2.0 --dry-run --changelog
```

### 输出
发布状态和发布包
