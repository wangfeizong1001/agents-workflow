---
name: document-generate
description: 按 Diataxis 框架生成完整文档
category: 文档类
allowed-tools: [Bash, Read, Write, Edit]
---

## document-generate

### 用途
Generate missing documentation from scratch for a feature, module, or entire project. Uses the Diataxis framework (tutorial / how-to / reference / explanation) to produce complete, structured documentation.

### 使用方式
1. 分析代码和功能
2. 确定文档类型（tutorial/how-to/reference/explanation）
3. 按 Diataxis 框架组织
4. 生成文档内容
5. 验证完整性

### 输入
- 代码文件或模块
- 功能描述
- 目标读者

### 输出
- Tutorial 文档
- How-to 指南
- Reference 文档
- Explanation 文档

### 示例
```markdown
# 文档结构

## Tutorial: 快速入门
- 面向初学者
- 步骤式指导
- 可运行示例

## How-to: 常见任务
- 解决具体问题
- 实用性优先

## Reference: API 参考
- 完整参数说明
- 类型定义

## Explanation: 架构说明
- 设计决策
- 概念解释
```
