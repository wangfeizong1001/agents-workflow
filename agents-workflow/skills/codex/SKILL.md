---
name: codex
description: OpenAI Codex CLI 包装器
category: 集成类
allowed-tools: [Bash, Read, Write, Edit]
---

## codex

### 用途
OpenAI Codex CLI 包装器 — 三种模式。用于代码生成、解释和重构。

### 使用方式
1. 选择操作模式
2. 准备输入
3. 调用 Codex CLI
4. 解析输出
5. 验证结果

### 输入
- 操作类型（generate/explain/refactor）
- 代码或描述
- 可选：上下文文件

### 输出
- 生成的代码
- 解释文档
- 重构建议

### 示例
```bash
# 生成代码
codex generate "实现一个快速排序函数"

# 解释代码
codex explain src/utils/sort.ts

# 重构代码
codex refactor src/legacy/old-code.ts --target modern
```
