---
name: import
description: 导入
skill: writing-plans
trigger: /import
category: 工具类
---

## /import 命令

### 用法
/import [导入源]

### 参数
- `--type`: 导入类型
- `--source`: 来源路径
- `--target`: 目标位置
- `--merge`: 合并策略

### 行为
1. 识别导入源
2. 解析导入内容
3. 转换格式
4. 导入到目标
5. 验证导入结果

### 示例
```
/import legacy-data.json --type data --target src/data
```

### 输出
导入报告和验证结果
