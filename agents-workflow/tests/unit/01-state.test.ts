import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { StateStore, type StateEvent } from "../../src/core/state/store.js";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ys-state-"));
});

describe("StateStore", () => {
  it("appendEvent 必须写入带 ts/id/session 的事件行", () => {
    const s = new StateStore(join(dir, "e.jsonl"));
    s.append({ type: "spec.created", specId: "s1", phase: "draft" });
    const events = s.read();
    expect(events).toHaveLength(1);
    const e = events[0] as StateEvent;
    expect(e.type).toBe("spec.created");
    expect(e.specId).toBe("s1");
    expect(typeof e.ts).toBe("string");
    expect(typeof e.id).toBe("string");
    expect(typeof e.session).toBe("string");
  });

  it("filterByType 必须按事件类型过滤", () => {
    const s = new StateStore(join(dir, "e.jsonl"));
    s.append({ type: "spec.created", specId: "s1" });
    s.append({ type: "plan.created", planId: "p1" });
    s.append({ type: "spec.created", specId: "s2" });
    const out = s.filterByType("spec.created");
    expect(out).toHaveLength(2);
  });

  it("latestByType 必须返回该类型最近一条事件", () => {
    const s = new StateStore(join(dir, "e.jsonl"));
    s.append({ type: "spec.phase.changed", specId: "s1", phase: "draft" });
    s.append({ type: "spec.phase.changed", specId: "s1", phase: "review" });
    const last = s.latestByType("spec.phase.changed");
    expect(last?.phase).toBe("review");
  });

  it("必须自动创建父目录", () => {
    const p = join(dir, "deep", "events.jsonl");
    const s = new StateStore(p);
    s.append({ type: "x" });
    expect(existsSync(p)).toBe(true);
  });
});

// 清理临时目录,避免大量测试运行时 /tmp 膨胀
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});
