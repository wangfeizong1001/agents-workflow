---
name: context-restore
description: 恢复之前保存的工作上下文
category: 上下文类
allowed-tools: [Bash, Read, Write, Edit]
---

## context-restore

### 用途
恢复工作上下文保存的 earlier by /context-save。加载最近保存的状态（跨所有分支），以便你可以从离开的地方继续。

### 使用方式
1. 查找最近的上下文文件
2. 恢复 git 状态
3. 加载决策历史
4. 恢复剩余任务
5. 继续工作

### 输入
- 可选：上下文文件路径
- 可选：分支名称

### 输出
- 恢复的状态
- 决策历史
- 剩余任务清单

### 示例
```bash
# 查找上下文文件
find . -name "context.json" -type f

# 恢复上下文
cat context.json | jq .

# 恢复 git 状态
git checkout feature/user-auth
git status
```

```markdown
## 恢复的上下文

### 上次状态
- 分支: feature/user-auth
- 最后提交: abc123

### 决策历史
- 使用 JWT 而非 session
- 密码使用 bcrypt 哈希

### 剩余工作
- [ ] 实现 token 刷新
- [ ] 添加单元测试
```
