---
name: map-codebase
description: 代码库映射
skill: explore
trigger: /map-codebase
category: 文档类
---

## /map-codebase 命令

### 用法
/map-codebase [代码库路径]

### 参数
- `--depth`: 映射深度
- `--include`: 包含内容
- `--format`: 输出格式

### 行为
1. 扫描代码库结构
2. 分析模块依赖
3. 识别核心组件
4. 生成架构图
5. 创建映射文档

### 示例
```
/map-codebase src --depth deep --include deps --format mermaid
```

### 输出
代码库映射文档，包含架构图和模块说明
