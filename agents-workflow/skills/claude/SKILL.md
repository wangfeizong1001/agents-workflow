---
name: claude
description: Claude Code CLI 包装器：审查/挑战/咨询
category: 集成类
allowed-tools: [Bash, Read, Write, Edit]
---

## claude

### 用途
Claude Code CLI wrapper for non-Claude hosts - three modes. Review: independent diff review via claude -p. Challenge: adversarial failure-mode review. Consult: ask Claude about the repo with read-only file tools.

### 使用方式
1. 选择模式（review/challenge/consult）
2. 准备输入（diff/问题/文件）
3. 调用 Claude CLI
4. 解析输出
5. 格式化结果

### 输入
- 模式选择
- 输入数据（diff/问题/文件路径）

### 输出
- 审查报告
- 挑战分析
- 咨询回答

### 示例
```bash
# Review 模式
claude -p "审查这个 diff" --diff < git diff

# Challenge 模式
claude -p "挑战这个设计的潜在失败模式" --file design.md

# Consult 模式
claude -p "解释这个模块的架构" --files src/
```
