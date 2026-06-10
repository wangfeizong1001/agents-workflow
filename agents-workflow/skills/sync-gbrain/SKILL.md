---
name: sync-gbrain
description: gbrain 仓库同步和搜索索引刷新
category: 工具类
allowed-tools: [Bash, Read, Write, Edit]
---

## sync-gbrain

### 用途
保持 gbrain 与本仓库代码同步，并刷新 CLAUDE.md 中的 agent 搜索指引。包装 skill-gbrain-sync 协调器，附加状态探测、原生代码面注册、能力检查和一个 verdict 块。可重入、幂等。

### 使用方式
1. 检测 gbrain 状态
2. 同步代码索引
3. 刷新搜索指引
4. 验证同步结果
5. 输出 verdict

### 输入
- 仓库路径
- 可选：同步选项

### 输出
- 同步状态
- 索引更新
- 搜索指引刷新

### 示例
```bash
# 同步 gbrain
sync-gbrain --repo /path/to/repo

# 强制重新索引
sync-gbrain --repo /path/to/repo --force

# 输出
✅ gbrain 同步完成
- 索引文件: 1,234
- 代码面: 567
- 搜索指引: 已更新
```
