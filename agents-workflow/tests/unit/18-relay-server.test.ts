import { describe, it, expect } from "vitest";
import { WebSocket } from "ws";
import { RelayServer } from "../../src/relay/server.js";

describe("RelayServer", () => {
  it("启动和关闭不抛异常", () => {
    const relay = new RelayServer(0);
    expect(relay.clientCount()).toBe(0);
    relay.close();
  });

  it("接受客户端 WebSocket 连接", async () => {
    const port = 14400 + Math.floor(Math.random() * 1000);
    const relay = new RelayServer(port);
    await new Promise<void>((resolve) => setTimeout(resolve, 200));

    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    const welcome = await new Promise<string>((resolve, reject) => {
      ws.on("message", (data) => resolve(data.toString()));
      ws.on("error", reject);
      setTimeout(() => reject(new Error("timeout")), 3000);
    });

    expect(JSON.parse(welcome).type).toBe("welcome");
    expect(relay.clientCount()).toBe(1);
    ws.close();
    relay.close();
  }, 10000);
});
