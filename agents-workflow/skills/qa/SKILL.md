---
name: qa
description: 系统化 Web 测试：发现 → 修复 → 验证闭环
category: 质量保障类
allowed-tools: [Bash, Read, Write, Edit]
---

## qa

### 用途
系统化 QA 测试 Web 应用并修复发现的缺陷。运行 QA 测试，然后迭代地修复源代码中的缺陷，每次提交原子化并重新验证。三个层级：Quick（仅 critical/high）、Standard（+ medium）、Exhaustive（+ cosmetic）。

### 使用方式
1. 确定测试层级（Quick/Standard/Exhaustive）
2. 使用 browse 技能导航和交互测试
3. 发现问题后定位源代码
4. 修复缺陷并提交原子化更改
5. 重新验证修复是否有效

### 输入
- 目标站点 URL
- 测试层级选择
- 可选：特定功能的测试焦点

### 输出
- Before/After 健康分
- 修复证据（截图）
- 可发布性摘要
- 每个修复的原子化提交

### 示例
```markdown
## QA 测试报告

### 健康分
- Before: 6.5/10
- After: 9.2/10

### 发现问题
1. [Critical] 登录表单缺少 CSRF token
2. [High] 移动端导航菜单无法关闭
3. [Medium] 搜索结果分页失效

### 修复记录
- 提交 abc123: 修复 CSRF token 验证
- 提交 def456: 修复移动端菜单 toggle 事件
```
