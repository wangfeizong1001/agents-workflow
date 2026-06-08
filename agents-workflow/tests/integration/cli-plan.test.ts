import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCli } from "../../src/interfaces/cli/index.js";

let cwd: string;
beforeEach(() => {
  cwd = mkdtempSync(join(tmpdir(), "ys-cli-plan-"));
});

describe("CLI plan 子命令", () => {
  it("yunshou plan create 必须从文件加载并生成计划", async () => {
    await runCli(["init"], cwd);
    const planFile = join(cwd, "plan.md");
    writeFileSync(planFile, "## 任务 1: A\n- x\n## 任务 2: B\n- y\n", "utf-8");
    const code = await runCli(
      ["plan", "create", "--id", "p1", "--title", "t", "--spec-id", "s1", "--from", planFile],
      cwd,
    );
    expect(code).toBe(0);
    expect(existsSync(join(cwd, ".yunshou", "plans", "p1.md"))).toBe(true);
  });

  it("yunshou plan next 必须输出下一个任务", async () => {
    await runCli(["init"], cwd);
    const planFile = join(cwd, "plan.md");
    writeFileSync(planFile, "## 任务 1: A\n- x\n", "utf-8");
    await runCli(
      ["plan", "create", "--id", "p1", "--title", "t", "--spec-id", "s1", "--from", planFile],
      cwd,
    );
    const code = await runCli(["plan", "next", "--id", "p1"], cwd);
    expect(code).toBe(0);
  });

  it("yunshou plan --help 必须正常退出", async () => {
    const code = await runCli(["plan", "--help"], cwd);
    expect(code).toBe(0);
  });

  it("yunshou plan 未知子命令必须返回非零", async () => {
    const code = await runCli(["plan", "unknown"], cwd);
    expect(code).toBe(1);
  });
});
