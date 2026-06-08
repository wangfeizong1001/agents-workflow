import { describe, it, expect, afterAll } from "vitest";
import { WebSocket } from "ws";
import { createWebSocketServer } from "../../src/mcp/ws-transport.js";

describe("MCP WebSocket 传输", () => {
  afterAll(() => {
    // 清理
  });

  it("WebSocket 客户端可以连接到 MCP 服务器并接收 tools/list", async () => {
    const port = 14300 + Math.floor(Math.random() * 1000);
    const sp = createWebSocketServer(process.cwd(), port);
    await new Promise<void>((resolve) => setTimeout(resolve, 800));

    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    const result = await new Promise<string>((resolve, reject) => {
      ws.on("open", () => {
        ws.send(JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/list",
        }));
      });
      ws.on("message", (data) => {
        resolve(data.toString());
      });
      ws.on("error", reject);
      setTimeout(() => reject(new Error("连接超时")), 5000);
    });

    const parsed = JSON.parse(result);
    expect(parsed.result).toBeDefined();
    expect(Array.isArray(parsed.result.tools)).toBe(true);
    expect(parsed.result.tools.length).toBeGreaterThan(0);
    ws.close();
  }, 15000);
});
