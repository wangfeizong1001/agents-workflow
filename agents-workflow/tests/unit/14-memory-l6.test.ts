import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MemoryL6 } from "../../src/memory/l6-dream.js";
import { appendLine } from "../../src/shared/jsonl.js";
import type { StateEvent } from "../../src/core/state/event.js";

function makeEvent(ts: string, type: string, overrides: Partial<StateEvent> = {}): StateEvent {
  return { id: `id-${ts}`, ts, session: "test", type, ...overrides } as StateEvent;
}

let dir: string;
let eventsFile: string;
let knowledgeFile: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ys-l6-"));
  eventsFile = join(dir, "events.jsonl");
  knowledgeFile = join(dir, "knowledge.yaml");
});

describe("MemoryL6", () => {
  it("dream 在没有压缩事件时返回 0", () => {
    appendLine(eventsFile, makeEvent("2026-01-01T00:00:00Z", "spec.created"));
    const l6 = new MemoryL6(eventsFile, knowledgeFile);
    expect(l6.dream()).toBe(0);
  });

  it("dream 产生联想事件", () => {
    const compressed: StateEvent & { data?: { compressed?: boolean; tags?: string[] } } = {
      id: "c1",
      ts: "2026-01-01T00:00:00Z",
      session: "l2-compressor",
      type: "spec.created",
      data: { compressed: true, tags: ["spec"] },
    };
    appendLine(eventsFile, makeEvent("2026-01-01T00:00:01Z", "spec.created"));
    appendLine(eventsFile, JSON.parse(JSON.stringify(compressed)) as StateEvent);

    const l6 = new MemoryL6(eventsFile, knowledgeFile);
    const n = l6.dream();
    expect(n).toBe(1);

    const after = readFileSync(eventsFile, "utf-8").trim();
    const lines = after.split("\n");
    const dreamEvents = lines.filter((l) => l.includes("dream"));
    expect(dreamEvents.length).toBe(1);
  });
});
