import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCli } from "../../src/interfaces/cli/index.js";

let cwd: string;
beforeEach(() => {
  cwd = mkdtempSync(join(tmpdir(), "ys-cli-install-"));
});

describe("CLI install/uninstall", () => {
  it("yunshou install opencode 必须写入 .opencode/", async () => {
    await runCli(["init"], cwd);
    const code = await runCli(["install", "opencode"], cwd);
    expect(code).toBe(0);
    expect(existsSync(join(cwd, ".opencode", "skills", "yunshou-workflow", "SKILL.md"))).toBe(true);
  });

  it("yunshou uninstall opencode 必须清理", async () => {
    await runCli(["init"], cwd);
    await runCli(["install", "opencode"], cwd);
    const code = await runCli(["uninstall", "opencode"], cwd);
    expect(code).toBe(0);
    expect(existsSync(join(cwd, ".opencode", "skills", "yunshou-workflow"))).toBe(false);
  });

  it("yunshou install --help 必须正常退出", async () => {
    const code = await runCli(["install", "--help"], cwd);
    expect(code).toBe(0);
  });

  it("yunshou install 不支持的适配器必须抛错", async () => {
    await runCli(["init"], cwd);
    const code = await runCli(["install", "vscode"], cwd);
    expect(code).toBe(1);
  });
});
