import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runLayer } from "../../src/core/verify/layer.js";
import { VerifyEngine } from "../../src/core/verify/engine.js";
import { YunShouError } from "../../src/shared/errors.js";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ys-verify-"));
});

describe("runLayer", () => {
  it("成功命令必须返回 passed 为 true", async () => {
    const r = await runLayer("lint", dir, ["echo", "ok"]);
    expect(r.name).toBe("lint");
    expect(r.passed).toBe(true);
    expect(r.stdout).toContain("ok");
    expect(r.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("失败命令必须返回 passed 为 false", async () => {
    const r = await runLayer("test", dir, ["false"]);
    expect(r.name).toBe("test");
    expect(r.passed).toBe(false);
  });
});

describe("VerifyEngine", () => {
  it("无 package.json 时跳过 lint/typecheck/test/build", async () => {
    const engine = new VerifyEngine({ root: dir });
    const report = await engine.runAll();
    expect(report.overall).toBe(false);
    for (const layer of report.layers) {
      if (layer.name === "spec-compliance") continue;
      expect(layer.passed).toBe(false);
    }
  });

  it("有 package.json 时运行命令 (使用空项目模拟)", async () => {
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "x" }));
    writeFileSync(join(dir, "vitest.config.ts"), "export default {}");
    const engine = new VerifyEngine({ root: dir });
    const report = await engine.runAll(["lint"]);
    expect(report.layers.length).toBe(1);
    expect(report.layers[0]!.name).toBe("lint");
  });

  it("all pass 时 requireAllPassed 不应抛错", () => {
    const engine = new VerifyEngine({ root: dir });
    const report = {
      startedAt: "",
      finishedAt: "",
      layers: [
        { name: "lint" as const, passed: true, stdout: "", stderr: "", durationMs: 0 },
      ],
      overall: true,
    };
    expect(() => engine.requireAllPassed(report)).not.toThrow();
  });

  it("有失败层时 requireAllPassed 必须抛 VERIFY_LAYER_FAILED", () => {
    const engine = new VerifyEngine({ root: dir });
    const report = {
      startedAt: "",
      finishedAt: "",
      layers: [
        { name: "lint" as const, passed: false, stdout: "", stderr: "err", durationMs: 0 },
      ],
      overall: false,
    };
    expect(() => engine.requireAllPassed(report)).toThrow(YunShouError);
  });
});
