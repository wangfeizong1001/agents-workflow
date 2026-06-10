---
name: code-review-fix
description: 代码审查修复
skill: apply-change
trigger: /code-review-fix
category: 审查类
---

## /code-review-fix 命令

### 用法
/code-review-fix [审查报告路径]

### 参数
- `--auto`: 自动修复所有问题
- `--selective`: 选择性修复
- `--verify`: 修复后验证

### 行为
1. 解析审查报告
2. 分类问题类型
3. 生成修复方案
4. 应用修复
5. 验证修复效果

### 示例
```
/code-review-fix review-report.md --auto --verify
```

### 输出
修复后的代码和修复报告
