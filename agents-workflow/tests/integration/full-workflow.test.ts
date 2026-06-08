import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCli } from "../../src/interfaces/cli/index.js";
import { installOpencode } from "../../src/adapters/opencode/install.js";

let cwd: string;
beforeEach(() => {
  cwd = mkdtempSync(join(tmpdir(), "ys-e2e-"));
});

describe("端到端工作流", () => {
  it("从 init 到 execute 完整跑通", async () => {
    expect(await runCli(["init"], cwd)).toBe(0);
    installOpencode(cwd);
    expect(existsSync(join(cwd, ".opencode", "skills", "yunshou-workflow", "SKILL.md"))).toBe(true);

    const specId = "hello-spec";
    expect(
      await runCli(
        [
          "spec",
          "create",
          "--id",
          specId,
          "--title",
          "Hello World",
          "--date",
          "2026-06-07",
          "--author",
          "tester",
          "--problem",
          "p".repeat(200),
          "--goal",
          "g".repeat(50),
          "--non-goals",
          "n",
          "--decisions",
          "d",
          "--scenarios",
          "s",
          "--risks",
          "r",
        ],
        cwd,
      ),
    ).toBe(0);
    expect(existsSync(join(cwd, ".yunshou", "specs", `${specId}.md`))).toBe(true);
  });
});
