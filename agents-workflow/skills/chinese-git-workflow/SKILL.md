---
name: chinese-git-workflow
description: 国内 Git 平台配置
category: 其他类
allowed-tools: [Bash, Read, Write, Edit]
---

## chinese-git-workflow

### 用途
国内 Git 平台配置参考——Gitee、Coding.net、极狐 GitLab、CNB 的 SSH/HTTPS/凭据/CI 接入差异与镜像同步配置。

### 使用方式
1. 选择平台（Gitee/Coding/GitLab/CNB）
2. 配置访问凭证
3. 设置 SSH/HTTPS
4. 配置 CI/CD
5. 设置镜像同步（可选）

### 输入
- 平台选择
- 项目信息
- 访问凭证

### 输出
- Git 配置
- CI/CD 配置
- 同步配置（可选）

### 示例
```bash
# Gitee 配置
git remote add origin git@gitee.com:username/repo.git

# Coding.net 配置
git remote add origin git@coding.net:team/repo.git

# 极狐 GitLab 配置
git remote add origin git@gitlab.cn:group/repo.git

# CI/CD 配置示例 (Gitee)
# .gitee/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
```
