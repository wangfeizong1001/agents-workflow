---
name: careful
description: 破坏性命令安全护栏
category: 安全类
allowed-tools: [Bash, Read, Write, Edit]
---

## careful

### 用途
破坏性命令的安全护栏。在执行 rm -rf、DROP TABLE、force-push、git reset --hard、kubectl delete 等破坏性操作前会先发出警告。用户可针对每条警告选择忽略。

### 使用方式
1. 检测即将执行的破坏性命令
2. 分析潜在影响
3. 发出警告
4. 等待用户确认
5. 执行或取消

### 输入
- 即将执行的命令
- 可选：生产环境标志

### 输出
- 风险评估
- 警告信息
- 执行确认

### 示例
```markdown
## ⚠️ 破坏性命令警告

### 命令
git reset --hard HEAD~3

### 风险
- 将丢失最近 3 个提交
- 工作区更改将被丢弃

### 影响
- 无法撤销
- 影响范围: 当前分支

### 选项
1. 确认执行
2. 取消操作
3. 查看受影响的提交

请选择 (1/2/3):
```
