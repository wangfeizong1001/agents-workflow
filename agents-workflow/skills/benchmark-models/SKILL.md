---
name: benchmark-models
description: 跨模型基准对比：时延、token、成本
category: 回顾类
allowed-tools: [Bash, Read, Write, Edit]
---

## benchmark-models

### 用途
Cross-model benchmark for skills. Runs the same prompt through Claude, GPT (via Codex CLI), and Gemini side-by-side — compares latency, tokens, cost, and optionally quality via LLM judge.

### 使用方式
1. 定义测试提示
2. 运行多个模型
3. 测量延迟
4. 计算 token 使用
5. 估算成本
6. 可选：质量评估

### 输入
- 测试提示
- 模型列表
- 可选：质量评估标准

### 输出
- 延迟对比
- Token 使用统计
- 成本估算
- 质量评分

### 示例
```markdown
## 模型基准对比

### 测试提示
"解释 TypeScript 中的泛型"

### 结果
| 模型 | 延迟 | Tokens | 成本 | 质量 |
|------|------|--------|------|------|
| Claude | 2.3s | 450 | $0.014 | 9/10 |
| GPT-4 | 3.1s | 520 | $0.016 | 8/10 |
| Gemini | 1.8s | 380 | $0.008 | 7/10 |

### 结论
- 最快: Gemini
- 最高质量: Claude
- 最低成本: Gemini
```
