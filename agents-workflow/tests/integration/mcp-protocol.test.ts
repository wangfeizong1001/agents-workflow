import { describe, it, expect } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildServer } from "../../src/interfaces/mcp/server.js";

interface McpToolDef {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

describe("MCP 服务器", () => {
  const cwd = mkdtempSync(join(tmpdir(), "ys-mcp-"));

  it("_requestHandlers 必须包含 tools/list 和 tools/call", () => {
    const server = buildServer(cwd);
    const srv = server as unknown as { _requestHandlers: Map<string, (req: unknown) => unknown> };
    expect(srv._requestHandlers.has("tools/list")).toBe(true);
    expect(srv._requestHandlers.has("tools/call")).toBe(true);
  });

  it("tools/list handler 必须返回至少 8 个工具", async () => {
    const server = buildServer(cwd);
    const srv = server as unknown as { _requestHandlers: Map<string, (req: { method: string; params: Record<string, unknown> }) => Promise<{ tools: McpToolDef[] }>> };
    const handler = srv._requestHandlers.get("tools/list");
    expect(handler).toBeDefined();
    const res = await handler!({ method: "tools/list", params: {} });
    expect(res.tools.length).toBeGreaterThanOrEqual(8);
  });

  it("tools/call handler 调用 yunshou_status 必须返回文本内容", async () => {
    const server = buildServer(cwd);
    const srv = server as unknown as { _requestHandlers: Map<string, (req: { method: string; params: { name: string; arguments?: Record<string, unknown> } }) => Promise<{ content: Array<{ type: string; text: string }> }>> };
    const handler = srv._requestHandlers.get("tools/call");
    expect(handler).toBeDefined();
    const res = await handler!({
      method: "tools/call",
      params: { name: "yunshou_status", arguments: {} },
    });
    expect(res.content[0]?.type).toBe("text");
  });

  it("tools/call handler 调用 yunshou_verify_all 必须返回验证结果", async () => {
    const server = buildServer(cwd);
    const srv = server as unknown as { _requestHandlers: Map<string, (req: { method: string; params: { name: string; arguments?: Record<string, unknown> } }) => Promise<{ content: Array<{ type: string; text: string }> }>> };
    const handler = srv._requestHandlers.get("tools/call");
    expect(handler).toBeDefined();
    const res = await handler!({
      method: "tools/call",
      params: { name: "yunshou_verify_all", arguments: {} },
    });
    expect(res.content[0]?.type).toBe("text");
    expect(res.content[0]?.text).toContain("[FAIL]");
  });

  it("tools/call handler 调用 yunshou_spec_create 无参数必须抛错", async () => {
    const server = buildServer(cwd);
    const srv = server as unknown as { _requestHandlers: Map<string, (req: { method: string; params: { name: string; arguments?: Record<string, unknown> } }) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }>> };
    const handler = srv._requestHandlers.get("tools/call");
    expect(handler).toBeDefined();
    const res = await handler!({
      method: "tools/call",
      params: { name: "yunshou_spec_create", arguments: {} },
    });
    expect(res.isError).toBe(true);
  });
});
