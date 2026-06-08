import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MemoryL4 } from "../../src/memory/l4-compressor.js";
import { appendLine } from "../../src/shared/jsonl.js";
import type { StateEvent } from "../../src/core/state/event.js";

function makeEvent(ts: string, type: string, overrides: Partial<StateEvent> = {}): StateEvent {
  return { id: `id-${ts}`, ts, session: "test", type, ...overrides } as StateEvent;
}

let dir: string;
let eventsFile: string;
let knowledgeFile: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ys-l4-"));
  eventsFile = join(dir, "events.jsonl");
  knowledgeFile = join(dir, "knowledge.yaml");
});

describe("MemoryL4", () => {
  it("compress 从完成的任务事件中提取模式知识", () => {
    appendLine(eventsFile, makeEvent("2026-01-01T00:00:00Z", "plan.task.completed", { taskId: "T1", planId: "p1" }));
    appendLine(eventsFile, makeEvent("2026-01-01T00:00:01Z", "plan.task.completed", { taskId: "T2", planId: "p1" }));
    const l4 = new MemoryL4(eventsFile, knowledgeFile);
    const n = l4.compress();
    expect(n).toBe(2);
    expect(existsSync(knowledgeFile)).toBe(true);
    const yaml = readFileSync(knowledgeFile, "utf-8");
    expect(yaml).toContain("T1");
    expect(yaml).toContain("T2");
  });

  it("compress 幂等 —— 第二次调用不重复添加", () => {
    appendLine(eventsFile, makeEvent("2026-01-01T00:00:00Z", "plan.task.completed", { taskId: "T1" }));
    const l4 = new MemoryL4(eventsFile, knowledgeFile);
    expect(l4.compress()).toBe(1);
    expect(l4.compress()).toBe(0);
  });

  it("compress 忽略非完成任务事件", () => {
    appendLine(eventsFile, makeEvent("2026-01-01T00:00:00Z", "spec.created"));
    const l4 = new MemoryL4(eventsFile, knowledgeFile);
    expect(l4.compress()).toBe(0);
  });
});
