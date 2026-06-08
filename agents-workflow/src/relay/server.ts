import { createServer } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";

interface Client {
  readonly id: string;
  readonly ws: WebSocket;
  readonly name?: string;
}

export class RelayServer {
  private readonly clients = new Map<string, Client>();
  private readonly wss: WebSocketServer;

  constructor(public readonly port: number) {
    const httpServer = createServer();
    this.wss = new WebSocketServer({ server: httpServer });

    this.wss.on("connection", (ws) => {
      const id = `client-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const client: Client = { id, ws };
      this.clients.set(id, client);

      ws.on("message", (data) => {
        const msg = data.toString();
        // Fan-out 给所有其他客户端
        for (const [cid, c] of this.clients) {
          if (cid !== id && c.ws.readyState === WebSocket.OPEN) {
            c.ws.send(JSON.stringify({ from: id, data: msg }));
          }
        }
      });

      ws.on("close", () => {
        this.clients.delete(id);
      });

      ws.send(JSON.stringify({ type: "welcome", clientId: id }));
    });

    httpServer.listen(port, "127.0.0.1");
  }

  public clientCount(): number {
    return this.clients.size;
  }

  public close(): void {
    this.wss.close();
  }
}
