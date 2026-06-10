---
name: transition
description: 转换
skill: writing-plans
trigger: /transition
category: 工作流类
---

## /transition 命令

### 用法
/transition [目标状态]

### 参数
- `--from`: 当前状态
- `--to`: 目标状态
- `--verify`: 验证转换

### 行为
1. 分析当前状态
2. 定义转换条件
3. 执行转换操作
4. 验证转换结果
5. 更新状态记录

### 示例
```
/transition --from development --to testing --verify
```

### 输出
状态转换报告和更新后的状态
