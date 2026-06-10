---
name: writing-skills
description: 创建/编辑/验证技能文件
category: 规范计划类
allowed-tools: [Bash, Read, Write, Edit]
---

## writing-skills

### 用途
当创建新技能、编辑现有技能或在部署前验证技能是否有效时使用。定义技能的元数据、用途、工作流和示例。

### 使用方式
1. 定义技能元数据（name, description, category）
2. 编写用途说明
3. 编写使用步骤
4. 定义输入/输出格式
5. 编写具体示例
6. 验证技能格式

### 输入
- 技能名称和描述
- 使用场景说明
- 可选：现有技能参考

### 输出
- SKILL.md 文件
- 技能元数据
- 使用文档

### 示例
```markdown
---
name: my-new-skill
description: 我的新技能描述
category: 工具类
allowed-tools: [Bash, Read, Write, Edit]
---

## my-new-skill

### 用途
这个技能用于...

### 使用方式
1. 第一步
2. 第二步

### 输入
- 输入说明

### 输出
- 输出说明

### 示例
\`\`\`
示例代码
\`\`\`
```
