import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCli } from "../../src/interfaces/cli/index.js";

let cwd: string;
beforeEach(() => {
  cwd = mkdtempSync(join(tmpdir(), "ys-cli-exec-"));
});

describe("CLI execute 子命令", () => {
  it("yunshou execute next 必须输出提示词文件路径", async () => {
    await runCli(["init"], cwd);
    const planFile = join(cwd, "p.md");
    writeFileSync(planFile, "## 任务 1: A\n- x\n", "utf-8");
    await runCli(
      ["plan", "create", "--id", "p1", "--title", "t", "--spec-id", "s1", "--from", planFile],
      cwd,
    );
    const code = await runCli(["execute", "next", "--plan-id", "p1"], cwd);
    expect(code).toBe(0);
    expect(existsSync(join(cwd, ".yunshou", "prompts", "p1.T1.md"))).toBe(true);
  });

  it("yunshou execute --help 必须正常退出", async () => {
    const code = await runCli(["execute", "--help"], cwd);
    expect(code).toBe(0);
  });

  it("yunshou execute 未知子命令必须返回非零", async () => {
    const code = await runCli(["execute", "unknown"], cwd);
    expect(code).toBe(1);
  });
});
