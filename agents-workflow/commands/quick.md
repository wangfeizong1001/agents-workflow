---
name: quick
description: 快速
skill: apply-change
trigger: /quick
category: 工具类
---

## /quick 命令

### 用法
/quick [快速任务]

### 参数
- `--task`: 任务描述
- `--priority`: 优先级
- `--timebox`: 时间限制

### 行为
1. 解析快速任务
2. 设置时间限制
3. 快速执行
4. 验证结果
5. 记录完成状态

### 示例
```
/quick "修复样式问题" --timebox 15min
```

### 输出
快速任务完成报告
