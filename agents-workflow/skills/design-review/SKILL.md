---
name: design-review
description: 视觉一致性 QA：间距、层次、AI slop
category: 设计类
allowed-tools: [Bash, Read, Write, Edit]
---

## design-review

### 用途
设计师视角的 QA：发现视觉不一致、间距问题、层次问题、AI slop 模式以及缓慢的交互。以原子提交方式迭代修复源问题，并通过修复前/后截图重新验证。

### 使用方式
1. 截图当前页面
2. 分析视觉问题
3. 识别 AI slop 模式
4. 修复问题
5. 截图验证修复
6. 生成对比报告

### 输入
- 页面 URL
- 设计规范（可选）
- 已知问题列表（可选）

### 输出
- 视觉问题清单
- 修复前后截图对比
- 修复提交
- 质量评分

### 示例
```markdown
## 设计审查报告

### 发现问题
1. **间距不一致**: 卡片间距 20px vs 24px
2. **层次模糊**: 标题和正文对比度不足
3. **AI Slop**: 重复的渐变背景模式

### 修复
- commit abc: 统一间距为 24px
- commit def: 增强标题对比度

### 验证
- before.png vs after.png
- 评分: 7.2 → 8.5
```
