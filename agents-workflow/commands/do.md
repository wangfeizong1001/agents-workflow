---
name: do
description: 执行
skill: apply-change
trigger: /do
category: 工具类
---

## /do 命令

### 用法
/do [操作]

### 参数
- `--action`: 执行动作
- `--target`: 目标对象
- `--options`: 执行选项

### 行为
1. 解析执行命令
2. 准备执行环境
3. 执行操作
4. 处理执行结果
5. 更新状态

### 示例
```
/do deploy --target production --options force
```

### 输出
操作执行结果
