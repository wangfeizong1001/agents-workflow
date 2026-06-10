---
name: setup-deploy
description: 部署平台配置
category: 工具类
allowed-tools: [Bash, Read, Write, Edit]
---

## setup-deploy

### 用途
Configure deployment settings for /land-and-deploy. Detects your deploy platform (Fly.io, Render, Vercel, Netlify, Heroku, GitHub Actions, custom), production URL, health check endpoints, and deploy status commands.

### 使用方式
1. 检测部署平台
2. 配置生产 URL
3. 设置健康检查端点
4. 配置部署命令
5. 保存到 CLAUDE.md

### 输入
- 部署平台类型
- 生产 URL
- 健康检查配置

### 输出
- 部署配置
- CLAUDE.md 更新
- 验证结果

### 示例
```markdown
## 部署配置

### 平台
- 类型: Vercel
- 项目: my-project

### 生产环境
- URL: https://my-project.vercel.app
- 健康检查: /api/health

### 部署命令
- 构建: `npm run build`
- 部署: `vercel --prod`
- 验证: `curl https://my-project.vercel.app/api/health`
```
