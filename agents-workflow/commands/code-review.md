---
name: code-review
description: 代码审查
skill: review
trigger: /code-review
category: 审查类
---

## /code-review 命令

### 用法
/code-review [PR 号或文件路径]

### 参数
- `--scope`: 审查范围（full/incremental）
- `--focus`: 审查重点（security/performance/style）
- `--severity`: 严重程度过滤

### 行为
1. 分析代码变更
2. 检查代码质量
3. 识别潜在问题
4. 提供改进建议
5. 生成审查报告

### 示例
```
/code-review PR#123 --focus security --severity high
```

### 输出
代码审查报告，包含问题列表和修复建议
