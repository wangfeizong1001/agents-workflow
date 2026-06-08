import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCli } from "../../src/interfaces/cli/index.js";

let cwd: string;
beforeEach(() => {
  cwd = mkdtempSync(join(tmpdir(), "ys-cli-verify-"));
});

describe("CLI verify 子命令", () => {
  it("yunshou verify all 在无 package.json 时返回非零", async () => {
    await runCli(["init"], cwd);
    const code = await runCli(["verify", "all"], cwd);
    expect(code).toBe(1);
  });

  it("yunshou verify report 必须输出 JSON 5 层结果", async () => {
    await runCli(["init"], cwd);
    writeFileSync(join(cwd, "package.json"), '{"name":"x","version":"0.0.0"}');
    const code = await runCli(["verify", "report"], cwd);
    expect(code).toBe(0);
  });

  it("yunshou verify --help 必须正常退出", async () => {
    const code = await runCli(["verify", "--help"], cwd);
    expect(code).toBe(0);
  });

  it("yunshou verify 未知子命令必须返回非零", async () => {
    const code = await runCli(["verify", "unknown"], cwd);
    expect(code).toBe(1);
  });
});
