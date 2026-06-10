---
name: chinese-commit-conventions
description: 中文 commit 约定
category: 其他类
allowed-tools: [Bash, Read, Write, Edit]
---

## chinese-commit-conventions

### 用途
中文 commit 与 changelog 配置参考——Conventional Commits 中文适配、commitlint/husky/commitizen 中文模板、conventional-changelog 中文配置。

### 使用方式
1. 配置 commitlint
2. 设置 husky hooks
3. 使用中文 commit 格式
4. 生成中文 changelog
5. 团队规范培训

### 输入
- 项目配置
- 团队规范

### 输出
- commitlint 配置
- husky 配置
- 中文 commit 模板

### 示例
```bash
# 中文 commit 格式
feat(用户模块): 添加用户注册功能
fix(登录): 修复密码验证错误
docs(README): 更新安装说明
style(代码): 格式化代码
refactor(重构): 提取公共方法
test(测试): 添加单元测试
chore(构建): 更新依赖

# commitlint 配置
module.exports = {
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 
      'refactor', 'test', 'chore'
    ]],
    'subject-full-stop': [2, 'never', '.']
  }
};
```
