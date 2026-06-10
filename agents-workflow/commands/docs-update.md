---
name: docs-update
description: 文档更新
skill: document-release
trigger: /docs-update
category: 文档类
---

## /docs-update 命令

### 用法
/docs-update [文档范围]

### 参数
- `--scope`: 更新范围
- `--verify`: 验证更新
- `--publish`: 发布更新

### 行为
1. 识别需要更新的文档
2. 分析代码变更
3. 更新文档内容
4. 验证文档准确性
5. 发布更新

### 示例
```
/docs-update README --scope api --verify --publish
```

### 输出
更新后的文档和更新报告
