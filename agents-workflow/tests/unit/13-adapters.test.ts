import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installClaudeCode } from "../../src/adapters/claude-code/install.js";
import { uninstallClaudeCode } from "../../src/adapters/claude-code/uninstall.js";
import { claudeCodeStatus } from "../../src/adapters/claude-code/status.js";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ys-cc-"));
});

describe("claude-code 适配器", () => {
  it("install 必须在 .claude/ 下生成 6 个文件", () => {
    installClaudeCode(dir);
    expect(existsSync(join(dir, ".claude", "skills", "yunshou-workflow", "SKILL.md"))).toBe(true);
    expect(existsSync(join(dir, ".claude", "commands", "spec.md"))).toBe(true);
    expect(existsSync(join(dir, ".claude", "commands", "plan.md"))).toBe(true);
    expect(existsSync(join(dir, ".claude", "commands", "execute.md"))).toBe(true);
    expect(existsSync(join(dir, ".claude", "agents", "yunshou-reviewer.md"))).toBe(true);
    expect(existsSync(join(dir, ".claude", "mcp", "yunshou-mcp.json"))).toBe(true);
  });

  it("install 必须写入 MCP 配置指向 yunshou CLI", () => {
    installClaudeCode(dir);
    const cfg = JSON.parse(
      readFileSync(join(dir, ".claude", "mcp", "yunshou-mcp.json"), "utf-8"),
    ) as { mcpServers: Record<string, { command: string; args: string[] }> };
    expect(cfg.mcpServers.yunshou.command).toBe("yunshou");
    expect(cfg.mcpServers.yunshou.args).toContain("mcp");
  });

  it("uninstall 必须清理所有生成文件", () => {
    installClaudeCode(dir);
    uninstallClaudeCode(dir);
    expect(existsSync(join(dir, ".claude", "skills", "yunshou-workflow", "SKILL.md"))).toBe(false);
    expect(existsSync(join(dir, ".claude", "mcp", "yunshou-mcp.json"))).toBe(false);
  });

  it("status 返回正确的安装状态", () => {
    expect(claudeCodeStatus(dir).installed).toBe(false);
    installClaudeCode(dir);
    expect(claudeCodeStatus(dir).installed).toBe(true);
    expect(claudeCodeStatus(dir).files.length).toBe(6);
  });
});
