import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PlanEngine } from "../../src/core/plan/engine.js";
import { StateStore } from "../../src/core/state/store.js";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ys-plan-"));
});

describe("PlanEngine", () => {
  it("create 必须生成 plan.md 并自动拆分任务", () => {
    const engine = new PlanEngine({ root: dir, store: new StateStore(join(dir, "e.jsonl")) });
    const id = engine.create({
      id: "p1",
      title: "示例计划",
      specId: "s1",
      markdown: "## 任务 1: A\n- x\n## 任务 2: B\n- y\n",
    });
    expect(existsSync(join(dir, ".yunshou", "plans", `${id}.md`))).toBe(true);
    const tasks = engine.tasks(id);
    expect(tasks).toHaveLength(2);
  });

  it("nextTask 必须返回第一个 pending 且依赖完成的任务", () => {
    const engine = new PlanEngine({ root: dir, store: new StateStore(join(dir, "e.jsonl")) });
    const id = engine.create({
      id: "p1",
      title: "t",
      specId: "s1",
      markdown: "## 任务 1: A\n- x\n## 任务 2: B\n- y\n",
    });
    const t1 = engine.nextTask(id);
    expect(t1?.id).toBe("p1.T1");
    engine.markTask(id, "p1.T1", "done");
    const t2 = engine.nextTask(id);
    expect(t2?.id).toBe("p1.T2");
  });

  it("nextTask 全部完成时返回 undefined", () => {
    const engine = new PlanEngine({ root: dir, store: new StateStore(join(dir, "e.jsonl")) });
    const id = engine.create({
      id: "p1",
      title: "t",
      specId: "s1",
      markdown: "## 任务 1: A\n- x\n",
    });
    engine.markTask(id, "p1.T1", "done");
    expect(engine.nextTask(id)).toBeUndefined();
  });

  it("advance 必须改写 frontmatter status", () => {
    const engine = new PlanEngine({ root: dir, store: new StateStore(join(dir, "e.jsonl")) });
    const id = engine.create({
      id: "p1",
      title: "t",
      specId: "s1",
      markdown: "## 任务 1: A\n- x\n",
    });
    engine.advance(id, "approved");
    const md = readFileSync(join(dir, ".yunshou", "plans", `${id}.md`), "utf-8");
    expect(md).toContain("status: approved");
  });

  it("tasks 在 planId 不存在时必须返回空数组", () => {
    const engine = new PlanEngine({ root: dir, store: new StateStore(join(dir, "e.jsonl")) });
    expect(engine.tasks("nope")).toEqual([]);
  });
});
