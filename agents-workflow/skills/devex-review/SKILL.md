---
name: devex-review
description: 开发者体验实时审计，带证据 DX 评分卡
category: 质量保障类
allowed-tools: [Bash, Read, Write, Edit]
---

## devex-review

### 用途
实时开发者体验审计。使用浏览工具实际测试开发者体验：导航文档、尝试入门流程、计时 TTHW（Time to Hello World）、截图错误信息、评估 CLI 帮助文本。生成带证据的 DX 评分卡。

### 使用方式
1. 模拟新开发者首次使用体验
2. 测量 TTHW（Time to Hello World）
3. 评估文档质量
4. 测试 CLI 帮助文本
5. 截图关键错误信息
6. 生成 DX 评分卡

### 输入
- 项目文档 URL 或仓库
- 目标开发者画像（初学者/中级/专家）
- 可选：竞品 DX 基线

### 输出
- DX 评分卡（0-10）
- TTHW 测量结果
- 摩擦点清单
- 改进建议

### 示例
```markdown
## DX 评分卡 - MyProject

### 总分: 6.8/10

### TTHW: 4m 32s
- 安装: 45s
- 配置: 2m 15s
- 首次运行: 1m 32s

### 摩擦点
1. README 缺少前置条件说明
2. CLI `--help` 输出过于简略
3. 错误信息缺少修复建议

### 证据
- screenshot-install-error.png
- screenshot-confusing-help.png
```
