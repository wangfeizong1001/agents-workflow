import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installClaudeCode } from "../../src/adapters/claude-code/install.js";
import { uninstallClaudeCode } from "../../src/adapters/claude-code/uninstall.js";
import { claudeCodeStatus } from "../../src/adapters/claude-code/status.js";
import { installCursor } from "../../src/adapters/cursor/install.js";
import { uninstallCursor } from "../../src/adapters/cursor/uninstall.js";
import { cursorStatus } from "../../src/adapters/cursor/status.js";
import { installTrae } from "../../src/adapters/trae/install.js";
import { uninstallTrae } from "../../src/adapters/trae/uninstall.js";
import { traeStatus } from "../../src/adapters/trae/status.js";
import { installCodebuddy } from "../../src/adapters/codebuddy/install.js";
import { uninstallCodebuddy } from "../../src/adapters/codebuddy/uninstall.js";
import { codebuddyStatus } from "../../src/adapters/codebuddy/status.js";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ys-adapter-"));
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

describe("Cursor 适配器", () => {
  it("install 必须在 .cursor/ 下生成文件", () => {
    installCursor(dir);
    expect(existsSync(join(dir, ".cursor", "skills", "yunshou-workflow", "SKILL.md"))).toBe(true);
    expect(existsSync(join(dir, ".cursor", "mcp", "yunshou-mcp.json"))).toBe(true);
  });

  it("uninstall 必须清理所有生成文件", () => {
    installCursor(dir);
    uninstallCursor(dir);
    expect(existsSync(join(dir, ".cursor", "skills", "yunshou-workflow", "SKILL.md"))).toBe(false);
    expect(existsSync(join(dir, ".cursor", "mcp", "yunshou-mcp.json"))).toBe(false);
  });

  it("status 返回正确的安装状态", () => {
    expect(cursorStatus(dir).installed).toBe(false);
    installCursor(dir);
    expect(cursorStatus(dir).installed).toBe(true);
  });
});

describe("Trae 适配器", () => {
  it("install 必须在 .trae/ 下生成文件", () => {
    installTrae(dir);
    expect(existsSync(join(dir, ".trae", "skills", "yunshou-workflow", "SKILL.md"))).toBe(true);
    expect(existsSync(join(dir, ".trae", "mcp", "yunshou-mcp.json"))).toBe(true);
  });

  it("uninstall 必须清理所有生成文件", () => {
    installTrae(dir);
    uninstallTrae(dir);
    expect(existsSync(join(dir, ".trae", "skills", "yunshou-workflow", "SKILL.md"))).toBe(false);
  });

  it("status 返回正确的安装状态", () => {
    expect(traeStatus(dir).installed).toBe(false);
    installTrae(dir);
    expect(traeStatus(dir).installed).toBe(true);
  });
});

describe("CodeBuddy 适配器", () => {
  it("install 必须在 .codebuddy/ 下生成文件", () => {
    installCodebuddy(dir);
    expect(existsSync(join(dir, ".codebuddy", "skills", "yunshou-workflow", "SKILL.md"))).toBe(true);
    expect(existsSync(join(dir, ".codebuddy", "mcp", "yunshou-mcp.json"))).toBe(true);
  });

  it("uninstall 必须清理所有生成文件", () => {
    installCodebuddy(dir);
    uninstallCodebuddy(dir);
    expect(existsSync(join(dir, ".codebuddy", "skills", "yunshou-workflow", "SKILL.md"))).toBe(false);
  });

  it("status 返回正确的安装状态", () => {
    expect(codebuddyStatus(dir).installed).toBe(false);
    installCodebuddy(dir);
    expect(codebuddyStatus(dir).installed).toBe(true);
  });
});
