import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installOpencode } from "../../src/adapters/opencode/install.js";
import { uninstallOpencode } from "../../src/adapters/opencode/uninstall.js";

let cwd: string;
beforeEach(() => {
  cwd = mkdtempSync(join(tmpdir(), "ys-adapter-"));
});

describe("OpenCode 适配器", () => {
  it("install 必须在 .opencode/ 下生成 5 类文件", () => {
    installOpencode(cwd);
    expect(existsSync(join(cwd, ".opencode", "skills", "yunshou-workflow", "SKILL.md"))).toBe(true);
    expect(existsSync(join(cwd, ".opencode", "commands", "spec.md"))).toBe(true);
    expect(existsSync(join(cwd, ".opencode", "commands", "plan.md"))).toBe(true);
    expect(existsSync(join(cwd, ".opencode", "commands", "execute.md"))).toBe(true);
    expect(existsSync(join(cwd, ".opencode", "agents", "yunshou-reviewer.md"))).toBe(true);
    expect(existsSync(join(cwd, ".opencode", "mcp", "yunshou-mcp.json"))).toBe(true);
  });

  it("install 必须写入 MCP 配置并指向 yunshou CLI", () => {
    installOpencode(cwd);
    const cfg = JSON.parse(
      readFileSync(join(cwd, ".opencode", "mcp", "yunshou-mcp.json"), "utf-8"),
    ) as { mcpServers: Record<string, { command: string; args: string[] }> };
    expect(cfg.mcpServers.yunshou.command).toBe("yunshou");
    expect(cfg.mcpServers.yunshou.args).toContain("mcp");
  });

  it("uninstall 必须清理所有生成文件", () => {
    installOpencode(cwd);
    uninstallOpencode(cwd);
    expect(existsSync(join(cwd, ".opencode", "skills", "yunshou-workflow", "SKILL.md"))).toBe(false);
    expect(existsSync(join(cwd, ".opencode", "mcp", "yunshou-mcp.json"))).toBe(false);
  });
});
