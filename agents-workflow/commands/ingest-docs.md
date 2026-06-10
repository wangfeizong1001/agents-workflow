---
name: ingest-docs
description: 导入文档
skill: document-generate
trigger: /ingest-docs
category: 文档类
---

## /ingest-docs 命令

### 用法
/ingest-docs [文档路径]

### 参数
- `--format`: 文档格式
- `--process`: 处理方式
- `--output`: 输出位置

### 行为
1. 读取文档内容
2. 解析文档结构
3. 提取关键信息
4. 整合到项目文档
5. 更新文档索引

### 示例
```
/ingest-docs external-api-docs.md --format markdown --process merge
```

### 输出
整合后的文档和更新日志
