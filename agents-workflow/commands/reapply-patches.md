---
name: reapply-patches
description: 重新应用补丁
skill: apply-change
trigger: /reapply-patches
category: 变更类
---

## /reapply-patches 命令

### 用法
/reapply-patches [补丁文件]

### 参数
- `--list`: 列出所有补丁
- `--select`: 选择特定补丁
- `--force`: 强制重新应用

### 行为
1. 扫描可用补丁
2. 检查补丁状态
3. 重新应用补丁
4. 解决冲突
5. 验证应用结果

### 示例
```
/reapply-patches --list
/reapply-patches --select hotfix-001 --force
```

### 输出
补丁应用报告和冲突解决建议
