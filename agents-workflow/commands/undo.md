---
name: undo
description: 撤销
skill: apply-change
trigger: /undo
category: 工作流类
---

## /undo 命令

### 用法
/undo [撤销范围]

### 参数
- `--steps`: 撤销步数
- `--file`: 指定文件
- `--dry-run`: 模拟撤销

### 行为
1. 分析变更历史
2. 识别可撤销变更
3. 执行撤销操作
4. 验证撤销结果
5. 更新状态记录

### 示例
```
/undo --steps 3 --dry-run
```

### 输出
撤销报告和更新后的状态
