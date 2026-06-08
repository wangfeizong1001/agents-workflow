// 模块职责: MCP 服务器 —— 通过 stdio 传输协议暴露云枢 8 个工具。
//
// 接口契约:
//   - buildServer(cwd): 构造 Server 实例,注册 ListTools / CallTool 处理器
//   - runMcp(cwd): 连接 StdioServerTransport 并阻塞,供 CLI mcp 子命令使用

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { allTools } from "./tools/index.js";

export function buildServer(cwd: string): Server {
  const server = new Server(
    { name: "yunshou", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: allTools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const name = String(req.params.name);
    const tool = allTools.find((t) => t.name === name);
    if (!tool) {
      return { content: [{ type: "text", text: `未知工具: ${name}` }], isError: true };
    }
    try {
      const text = await tool.handler((req.params.arguments ?? {}) as Record<string, string>, cwd);
      return { content: [{ type: "text", text }] };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text", text: `错误: ${msg}` }], isError: true };
    }
  });

  return server;
}

export async function runMcp(cwd: string): Promise<void> {
  const server = buildServer(cwd);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
