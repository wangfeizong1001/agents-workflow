---
name: pause-work
description: 暂停工作
skill: context-save
trigger: /pause-work
category: 工作流类
---

## /pause-work 命令

### 用法
/pause-work [原因]

### 参数
- `--save`: 保存工作状态
- `--notify`: 通知相关人员
- `--resume`: 设置恢复计划

### 行为
1. 保存当前工作状态
2. 记录暂停原因
3. 通知相关人员
4. 设置恢复提醒
5. 创建暂停报告

### 示例
```
/pause-work "等待外部依赖" --save --notify
```

### 输出
暂停报告和恢复计划
