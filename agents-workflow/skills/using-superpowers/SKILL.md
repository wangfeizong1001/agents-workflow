---
name: using-superpowers
description: 技能发现和使用
category: 其他类
allowed-tools: [Bash, Read, Write, Edit]
---

## using-superpowers

### 用途
在开始任何对话时使用——确立如何查找和使用技能，要求在任何响应（包括澄清性问题）之前调用 Skill 工具。

### 使用方式
1. 扫描可用技能
2. 匹配用户意图
3. 加载相关技能
4. 按技能指导执行
5. 输出结果

### 输入
- 用户请求
- 可选：技能过滤条件

### 输出
- 技能匹配结果
- 执行结果

### 示例
```markdown
## 技能发现

### 用户请求
"帮我测试这个网站"

### 技能匹配
1. browse - 浏览器交互 ⭐
2. qa - 系统化测试
3. qa-only - 仅报告测试

### 加载技能
使用 qa 技能进行系统化测试

### 执行
按 qa 技能的工作流执行测试
```
