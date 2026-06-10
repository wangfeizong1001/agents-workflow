---
name: node-repair
description: 节点修复
skill: investigate
trigger: /node-repair
category: 调试类
---

## /node-repair 命令

### 用法
/node-repair [节点名称]

### 参数
- `--check`: 检查节点状态
- `--repair`: 执行修复
- `--backup`: 修复前备份

### 行为
1. 检查节点状态
2. 识别损坏部分
3. 创建备份
4. 执行修复操作
5. 验证修复结果

### 示例
```
/node-repair git-repo --check --repair --backup
```

### 输出
节点修复报告和验证结果
