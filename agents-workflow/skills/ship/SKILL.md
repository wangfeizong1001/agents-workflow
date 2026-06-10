---
name: ship
description: Ship 工作流：检测 base → 合入 → 测试 → 审查 → bump 版本 → PR
category: 交付部署类
allowed-tools: [Bash, Read, Write, Edit]
---

## ship

### 用途
完整的 Ship 工作流：检测并合入 base 分支、运行测试、审查 diff、bump 版本号、更新 CHANGELOG、提交、推送、创建 PR。在用户说代码准备好或想要部署时主动调用。

### 使用方式
1. 检测 base 分支并合入最新变更
2. 运行测试套件
3. 审查 diff
4. Bump VERSION 文件
5. 更新 CHANGELOG
6. 提交并推送
7. 创建 PR

### 输入
- 当前分支的代码变更
- 可选：base 分支名称（默认 main/master）
- 可选：版本号覆盖

### 输出
- 合并后的提交
- 推送到远程
- PR URL
- 变更摘要

### 示例
```bash
# 自动执行完整 ship 流程
1. git fetch origin main
2. git merge origin/main
3. npm test
4. bump-version patch
5. 更新 CHANGELOG.md
6. git add -A && git commit -m "release: v1.2.3"
7. git push origin feature-branch
8. gh pr create --title "Release v1.2.3"
```
