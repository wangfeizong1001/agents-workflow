import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { L3Working } from "../../src/memory/l3-working.js";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ys-l3-"));
});

describe("L3 工作记忆", () => {
  it("snapshot 必须保存到 .yunshou/memory/l3/ 目录", () => {
    const l3 = new L3Working(join(dir, ".yunshou"));
    const id = l3.snapshot("phase=spec", { decisions: ["选 A"] });
    expect(existsSync(join(dir, ".yunshou", "memory", "l3", `${id}.yaml`))).toBe(true);
  });

  it("load 必须能读回 snapshot 的 payload", () => {
    const l3 = new L3Working(join(dir, ".yunshou"));
    const id = l3.snapshot("phase=plan", { key: "value" });
    expect(l3.load(id)).toMatchObject({ key: "value" });
  });

  it("latest 必须返回最近一次 snapshot 的 id", () => {
    const l3 = new L3Working(join(dir, ".yunshou"));
    l3.snapshot("a", { n: 1 });
    const id2 = l3.snapshot("b", { n: 2 });
    expect(l3.latest()).toBe(id2);
  });
});
