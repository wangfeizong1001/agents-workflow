---
name: ios-design-review
description: iOS 视觉设计审计
category: iOS 相关类
allowed-tools: [Bash, Read, Write, Edit]
---

## ios-design-review

### 用途
Visual design audit for iOS apps on real hardware. Connects to a real iPhone, screenshots every screen, evaluates against Apple HIG, DESIGN.md, and design best practices. Scores each dimension 0-10.

### 使用方式
1. 连接到真实设备
2. 截图每个屏幕
3. 对比 Apple HIG
4. 检查设计一致性
5. 评分各维度
6. 生成审计报告

### 输入
- iOS 项目路径
- DESIGN.md（可选）
- 设计规范

### 输出
- 截图序列
- 各维度评分
- 问题清单
- 改进建议

### 示例
```markdown
## iOS 设计审计

### 评分
| 维度 | 分数 | 说明 |
|------|------|------|
| 视觉层次 | 8/10 | 清晰的信息优先级 |
| 间距一致性 | 7/10 | 部分间距不统一 |
| 颜色使用 | 9/10 | 符合品牌规范 |
| 字体 | 8/10 | 使用 SF Pro |

### 问题
1. ⚠️ 列表项间距不一致
2. ⚠️ 部分按钮缺少无障碍标签

### 建议
- 统一间距为 16pt
- 添加 accessibilityLabel
```
