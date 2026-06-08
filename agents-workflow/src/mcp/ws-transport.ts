import { createServer, type Server as HttpServer } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";

interface Transport {
  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;
  sessionId?: string;
  start(): Promise<void>;
  send(message: JSONRPCMessage): Promise<void>;
  close(): Promise<void>;
}

class WebSocketClientTransport implements Transport {
  public onclose?: () => void;
  public onerror?: (error: Error) => void;
  public onmessage?: (message: JSONRPCMessage) => void;
  public sessionId?: string;

  constructor(
    private readonly ws: WebSocket,
    sessionId: string,
  ) {
    this.sessionId = sessionId;
    this.ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString()) as JSONRPCMessage;
        this.onmessage?.(msg);
      } catch (err) {
        this.onerror?.(err instanceof Error ? err : new Error(String(err)));
      }
    });
    this.ws.on("close", () => this.onclose?.());
    this.ws.on("error", (err) => this.onerror?.(err));
  }

  async start(): Promise<void> {
    // WebSocket 连接已建立;无需额外操作
  }

  async send(message: JSONRPCMessage): Promise<void> {
    this.ws.send(JSON.stringify(message));
  }

  async close(): Promise<void> {
    this.ws.close();
  }
}

export async function createWebSocketServer(cwd: string, port: number): Promise<void> {
  const { buildServer } = await import("../interfaces/mcp/server.js");

  const httpServer: HttpServer = createServer();
  const wss = new WebSocketServer({ server: httpServer });
  let sessionCounter = 0;

  wss.on("connection", (ws) => {
    sessionCounter++;
    const sessionId = `ws-${sessionCounter}-${Date.now()}`;
    const transport = new WebSocketClientTransport(ws, sessionId);
    const server = buildServer(cwd);
    server.connect(transport).catch((err) => {
      transport.onerror?.(err);
    });
  });

  return new Promise<void>((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(port, "127.0.0.1", () => {
      resolve();
    });
  });
}

// 测试辅助: 重置端口
export async function closeWebSocketServer(
  httpServer: HttpServer,
  wss: WebSocketServer,
): Promise<void> {
  wss.close();
  httpServer.close();
}
