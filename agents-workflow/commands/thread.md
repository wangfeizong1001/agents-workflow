---
name: thread
description: 线程
skill: writing-plans
trigger: /thread
category: 工具类
---

## /thread 命令

### 用法
/thread [线程操作]

### 参数
- `--create`: 创建新线程
- `--list`: 列出线程
- `--switch`: 切换线程
- `--merge`: 合并线程

### 行为
1. 管理工作线程
2. 跟踪线程状态
3. 切换上下文
4. 合并相关线程
5. 生成线程报告

### 示例
```
/thread --create "API 开发"
/thread --list
/thread --switch api-dev
```

### 输出
线程状态和切换确认
