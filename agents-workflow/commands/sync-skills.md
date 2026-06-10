---
name: sync-skills
description: 同步技能
skill: sync-gbrain
trigger: /sync-skills
category: 工具类
---

## /sync-skills 命令

### 用法
/sync-skills [技能源]

### 参数
- `--pull`: 从远程拉取
- `--push`: 推送到远程
- `--list`: 列出技能
- `--verify`: 验证技能

### 行为
1. 扫描本地技能
2. 比较远程版本
3. 同步差异
4. 验证技能完整性
5. 更新技能索引

### 示例
```
/sync-skills --pull --verify
```

### 输出
技能同步报告和版本信息
