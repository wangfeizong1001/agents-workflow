import { createServer, type Server as HttpServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";
import { randomUUID } from "node:crypto";

interface Transport {
  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;
  sessionId?: string;
  start(): Promise<void>;
  send(message: JSONRPCMessage): Promise<void>;
  close(): Promise<void>;
}

class SSEServerTransport implements Transport {
  public onclose?: () => void;
  public onerror?: (error: Error) => void;
  public onmessage?: (message: JSONRPCMessage) => void;
  public sessionId?: string;
  private res: ServerResponse | null = null;
  private buffer: string[] = [];

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  setResponse(res: ServerResponse): void {
    this.res = res;
    for (const line of this.buffer) {
      res.write(line);
    }
    this.buffer = [];
  }

  async start(): Promise<void> {
    // 等待 setResponse 设值
  }

  async send(message: JSONRPCMessage): Promise<void> {
    const data = `data: ${JSON.stringify(message)}\n\n`;
    if (this.res) {
      this.res.write(data);
    } else {
      this.buffer.push(data);
    }
  }

  async close(): Promise<void> {
    if (this.res) this.res.end();
    this.onclose?.();
  }
}

export async function createSSEServer(cwd: string, port: number): Promise<void> {
  const { buildServer } = await import("../interfaces/mcp/server.js");
  const sessions = new Map<string, SSEServerTransport>();
  const httpServer: HttpServer = createServer((req, res) => {
    if (!req.url) {
      res.writeHead(400);
      res.end();
      return;
    }
    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

    // SSE 端点: 客户端建立 SSE 连接
    if (url.pathname === "/sse" && req.method === "GET") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });
      const sessionId = randomUUID();
      const transport = new SSEServerTransport(sessionId);
      sessions.set(sessionId, transport);
      transport.setResponse(res);
      const server = buildServer(cwd);
      server.connect(transport).catch((err) => transport.onerror?.(err));

      // 发送 endpoint 事件告知客户端 POST 地址
      const endpointUrl = `/message?sessionId=${sessionId}`;
      res.write(`event: endpoint\ndata: ${JSON.stringify(endpointUrl)}\n\n`);

      req.on("close", () => {
        sessions.delete(sessionId);
        void transport.close();
      });
      return;
    }

    // POST 端: 客户端发送 JSON-RPC 消息
    if (url.pathname === "/message" && req.method === "POST") {
      const sid = url.searchParams.get("sessionId");
      if (!sid || !sessions.has(sid)) {
        res.writeHead(400);
        res.end("Missing or invalid sessionId");
        return;
      }
      let body = "";
      req.on("data", (chunk) => { body += chunk.toString(); });
      req.on("end", () => {
        try {
          const msg = JSON.parse(body) as JSONRPCMessage;
          sessions.get(sid)!.onmessage?.(msg);
          res.writeHead(202);
          res.end();
        } catch {
          res.writeHead(400);
          res.end("Invalid JSON");
        }
      });
      return;
    }

    res.writeHead(404);
    res.end("Not found");
  });

  return new Promise<void>((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(port, "127.0.0.1", () => resolve());
  });
}

export async function closeSSEServer(httpServer: HttpServer): Promise<void> {
  httpServer.close();
}
