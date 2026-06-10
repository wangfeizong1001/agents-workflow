---
name: note
description: 笔记
skill: learn
trigger: /note
category: 日常类
---

## /note 命令

### 用法
/note [笔记内容]

### 参数
- `--add`: 添加新笔记
- `--list`: 列出笔记
- `--search`: 搜索笔记
- `--tag`: 添加标签

### 行为
1. 记录笔记内容
2. 添加元数据
3. 分类标签
4. 搜索历史笔记
5. 导出笔记

### 示例
```
/note --add "API 设计决策" --tag design
/note --search "认证"
```

### 输出
笔记记录和搜索结果
