import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MemoryL2 } from "../../src/memory/l2-compressor.js";
import { appendLine } from "../../src/shared/jsonl.js";
import type { StateEvent } from "../../src/core/state/event.js";

function makeEvent(ts: string, type: string): StateEvent {
  return { id: `id-${ts}`, ts, session: "test", type } as StateEvent;
}

let dir: string;
let eventsFile: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ys-l2-"));
  eventsFile = join(dir, "events.jsonl");
});

describe("MemoryL2", () => {
  it("compress 返回压缩条目数", () => {
    for (let i = 0; i < 10; i++) {
      appendLine(eventsFile, makeEvent(`2026-01-01T00:00:0${i}Z`, "spec.created"));
    }
    const l2 = new MemoryL2(eventsFile);
    const n = l2.compress();
    expect(typeof n).toBe("number");
  });

  it("compress 合并 5 条相邻同类型事件为 1 条", () => {
    for (let i = 0; i < 5; i++) {
      appendLine(eventsFile, makeEvent(`2026-01-01T00:00:0${i}Z`, "spec.created"));
    }
    const linesBefore = readFileSync(eventsFile, "utf-8").trim().split("\n").length;
    expect(linesBefore).toBe(5);

    const l2 = new MemoryL2(eventsFile);
    const n = l2.compress();

    const after = readFileSync(eventsFile, "utf-8").trim();
    const lines = after.split("\n");
    const compressed = lines.filter((l) => l.includes("compressed")).length;
    expect(compressed).toBe(1);
    expect(n).toBe(1);
  });

  it("compress 幂等安全 —— 第二次调用不重复压缩", () => {
    for (let i = 0; i < 10; i++) {
      appendLine(eventsFile, makeEvent(`2026-01-01T00:00:0${i}Z`, "spec.created"));
    }
    const l2 = new MemoryL2(eventsFile);
    const first = l2.compress();
    const second = l2.compress();
    expect(first).toBeGreaterThanOrEqual(0);
    expect(second).toBe(0);
  });

  it("compress 不影响不同类型混合事件", () => {
    for (let i = 0; i < 3; i++) {
      appendLine(eventsFile, makeEvent(`2026-01-01T00:00:0${i}Z`, "spec.created"));
    }
    appendLine(eventsFile, makeEvent("2026-01-01T00:00:03Z", "plan.created"));
    for (let i = 4; i < 7; i++) {
      appendLine(eventsFile, makeEvent(`2026-01-01T00:00:0${i}Z`, "spec.created"));
    }
    const l2 = new MemoryL2(eventsFile);
    const n = l2.compress();
    expect(n).toBe(0); // 不够 5 条相邻同类型
  });
});
