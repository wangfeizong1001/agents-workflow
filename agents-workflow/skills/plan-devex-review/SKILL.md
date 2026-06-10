---
name: plan-devex-review
description: DX 计划审查：开发者画像 + 竞品对标
category: 审查类
allowed-tools: [Bash, Read, Write, Edit]
---

## plan-devex-review

### 用途
交互式开发者体验计划审查。探索开发者画像，对标竞争对手，设计魔法时刻，并在评分前追溯摩擦点。三种模式：DX EXPANSION、DX POLISH、DX TRIAGE。

### 使用方式
1. 定义开发者画像
2. 对标竞品 DX
3. 识别魔法时刻
4. 追溯摩擦点
5. 选择审查模式
6. 输出改进计划

### 输入
- 产品计划
- 目标开发者画像
- 竞品列表（可选）

### 输出
- 开发者画像
- 竞品 DX 对比
- 魔法时刻设计
- 摩擦点清单
- 改进建议

### 示例
```markdown
## DX 计划审查

### 开发者画像
- 级别: 中级
- 偏好: TypeScript, React
- 痛点: 复杂配置

### 竞品对比
| 特性 | 我们 | 竞品A | 竞品B |
|------|------|-------|-------|
| TTHW | 5min | 3min | 8min |
| 文档 | 一般 | 优秀 | 良好 |

### 魔法时刻
- 零配置启动
- 智能默认值
- 即时反馈
```
