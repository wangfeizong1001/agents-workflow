import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ExecuteEngine } from "../../src/core/execute/engine.js";
import { PlanEngine } from "../../src/core/plan/engine.js";
import { StateStore } from "../../src/core/state/store.js";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ys-exec-"));
});

describe("ExecuteEngine", () => {
  it("nextPrompt 必须输出包含任务 ID 和提示词的文件", () => {
    const store = new StateStore(join(dir, "e.jsonl"));
    const plan = new PlanEngine({ root: dir, store });
    plan.create({
      id: "p1",
      title: "t",
      specId: "s1",
      markdown: "## 任务 1: A\n- x\n",
    });
    const exec = new ExecuteEngine({ root: dir, store });
    const out = exec.nextPrompt("p1");
    expect(out?.taskId).toBe("p1.T1");
    expect(out?.prompt).toContain("p1.T1");
    expect(existsSync(out!.promptFile)).toBe(true);
  });

  it("planId 不存在时 nextPrompt 必须返回 undefined", () => {
    const store = new StateStore(join(dir, "e.jsonl"));
    const exec = new ExecuteEngine({ root: dir, store });
    expect(exec.nextPrompt("nope")).toBeUndefined();
  });
});
