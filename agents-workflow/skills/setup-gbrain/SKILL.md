---
name: setup-gbrain
description: gbrain 初始化和注册
category: 工具类
allowed-tools: [Bash, Read, Write, Edit]
---

## setup-gbrain

### 用途
为此编码代理设置 gbrain：安装 CLI、初始化本地 PGLite 或 Supabase brain、注册 MCP、捕获每个远程的信任策略。一条命令从零到"gbrain 正在运行，并且此代理可以调用它"。

### 使用方式
1. 检查 gbrain 是否已安装
2. 安装 CLI（如需要）
3. 初始化 brain 存储
4. 注册 MCP 服务
5. 配置信任策略
6. 验证安装

### 输入
- brain 类型（PGlite/Supabase）
- 可选：远程连接配置

### 输出
- gbrain 安装状态
- brain 初始化
- MCP 注册
- 信任策略

### 示例
```bash
# 安装 gbrain
npm install -g gbrain

# 初始化本地 brain
gbrain init --type pglite

# 注册 MCP
gbrain mcp register --name my-server --url http://localhost:3000

# 验证
gbrain status
✅ gbrain 运行中
- 类型: PGLite
- MCP 服务: 2
- 信任策略: 已配置
```
