---
name: mcp-builder
description: MCP 服务器构建方法论
category: 工具类
allowed-tools: [Bash, Read, Write, Edit]
---

## mcp-builder

### 用途
MCP 服务器构建方法论——系统化构建生产级 MCP 工具，让 AI 助手连接外部能力。

### 使用方式
1. 定义工具能力
2. 设计 API 接口
3. 实现 MCP 协议
4. 添加认证和授权
5. 测试和部署

### 输入
- 工具需求描述
- API 设计
- 可选：现有服务

### 输出
- MCP 服务器代码
- API 文档
- 测试套件
- 部署配置

### 示例
```typescript
// MCP 服务器示例
import { Server } from '@modelcontextprotocol/server';

const server = new Server({
  name: 'my-tool',
  version: '1.0.0',
});

server.tool('get-data', async (params) => {
  const data = await fetchData(params);
  return { content: [{ type: 'text', text: JSON.stringify(data) }] };
});

server.listen(3000);
```
