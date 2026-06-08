import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { L5Extractor } from "../../src/memory/l5-extractor.js";
import { L7Handoff } from "../../src/memory/l7-handoff.js";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ys-mem-"));
});

describe("L5 知识提取", () => {
  it("extractSnippet 必须把工具输出转成 knowledge 候选", () => {
    const l5 = new L5Extractor(join(dir, "l5.yaml"));
    const cand = l5.extractSnippet("rg", "total 10 lines");
    expect(cand.kind).toBe("snippet");
    expect(cand.title).toContain("rg");
  });
});

describe("L7 跨会话交接", () => {
  it("write 必须生成 handoff.yaml", () => {
    const l7 = new L7Handoff(join(dir, ".yunshou"));
    l7.write({ summary: "上次做到 T3", next: "T4" });
    expect(existsSync(join(dir, ".yunshou", "memory", "l7", "handoff.yaml"))).toBe(true);
  });
});
