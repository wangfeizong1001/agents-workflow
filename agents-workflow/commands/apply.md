---
name: apply
description: 应用变更
skill: apply-change
trigger: /apply
category: 变更类
---

## /apply 命令

### 用法
/apply [变更文件]

### 参数
- `--dry-run`: 模拟应用
- `--force`: 强制应用
- `--verify`: 应用后验证

### 行为
1. 分析变更内容
2. 检查依赖关系
3. 应用变更
4. 验证变更结果
5. 更新状态记录

### 示例
```
/apply changes.patch --dry-run --verify
```

### 输出
变更应用报告和验证结果
