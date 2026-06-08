// 云枢 CLI spec 子命令集成测试 —— 覆盖 create 与 advance 两条路径。
//
// plan 已知修正:
//   --problem/--goal 各 150(原 60)以满足 SpecEngine MIN_BODY(200) 门禁
//   --scenarios 含 3 条(原 1 条)以满足 guard 场景数(≥ 3)门禁

import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCli } from "../../src/interfaces/cli/index.js";

let cwd: string;
beforeEach(() => {
  cwd = mkdtempSync(join(tmpdir(), "ys-cli-spec-"));
});

describe("CLI spec 子命令", () => {
  it("yunshou spec create 必须调用引擎生成规格", async () => {
    await runCli(["init"], cwd);
    const code = await runCli(
      [
        "spec", "create",
        "--id", "s1",
        "--title", "示例",
        "--date", "2026-06-07",
        "--author", "a",
        "--problem", "p".repeat(150),
        "--goal", "g".repeat(150),
        "--non-goals", "n",
        "--decisions", "d",
        "--scenarios", "sc",
        "--risks", "r",
      ],
      cwd,
    );
    expect(code).toBe(0);
    expect(existsSync(join(cwd, ".yunshou", "specs", "s1.md"))).toBe(true);
  });

  it("yunshou spec create 质量门禁失败必须返回非零", async () => {
    await runCli(["init"], cwd);
    const code = await runCli(
      [
        "spec", "create",
        "--id", "s2",
        "--title", "x",
        "--date", "2026-06-07",
        "--author", "a",
        "--problem", "短",
        "--goal", "短",
        "--non-goals", "n",
        "--decisions", "d",
        "--scenarios", "sc",
        "--risks", "r",
      ],
      cwd,
    );
    expect(code).toBe(1);
    expect(existsSync(join(cwd, ".yunshou", "specs", "s2.md"))).toBe(false);
  });

  it("yunshou spec advance 必须转移阶段", async () => {
    await runCli(["init"], cwd);
    await runCli(
      [
        "spec", "create",
        "--id", "s1",
        "--title", "标题",
        "--date", "2026-06-07",
        "--author", "a",
        "--problem", "p".repeat(150),
        "--goal", "g".repeat(150),
        "--non-goals", "n",
        "--decisions", "d",
        "--scenarios", "s1\n\n#### Scenario: s2\n\n#### Scenario: s3",
        "--risks", "r",
      ],
      cwd,
    );
    const code = await runCli(["spec", "advance", "--id", "s1", "--to", "review"], cwd);
    expect(code).toBe(0);
  });

  it("yunshou spec advance 非法阶段必须返回非零", async () => {
    await runCli(["init"], cwd);
    await runCli(
      [
        "spec", "create",
        "--id", "s3",
        "--title", "跳跃测试",
        "--date", "2026-06-07",
        "--author", "a",
        "--problem", "p".repeat(150),
        "--goal", "g".repeat(150),
        "--non-goals", "n",
        "--decisions", "d",
        "--scenarios", "s1\n\n#### Scenario: s2\n\n#### Scenario: s3",
        "--risks", "r",
      ],
      cwd,
    );
    // draft → approved 跳过 review, guard 应拒绝
    const code = await runCli(["spec", "advance", "--id", "s3", "--to", "approved"], cwd);
    expect(code).toBe(1);
  });

  it("yunshou spec --help 必须正常退出", async () => {
    const code = await runCli(["spec", "--help"], cwd);
    expect(code).toBe(0);
  });

  it("yunshou spec 未知子命令必须返回非零", async () => {
    const code = await runCli(["spec", "unknown"], cwd);
    expect(code).toBe(1);
  });
});
