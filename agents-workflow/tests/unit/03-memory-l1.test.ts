import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { L1Cache } from "../../src/memory/l1-tool-results.js";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ys-l1-"));
});

describe("L1 工具结果缓存", () => {
  it("get 必须按 (tool, args-hash) 返回缓存值", () => {
    const c = new L1Cache(join(dir, "l1.json"));
    c.set("read", { path: "/a" }, { content: "hi" });
    expect(c.get("read", { path: "/a" })).toEqual({ content: "hi" });
  });

  it("不同参数必须视为不同 key", () => {
    const c = new L1Cache(join(dir, "l1.json"));
    c.set("read", { path: "/a" }, "A");
    c.set("read", { path: "/b" }, "B");
    expect(c.get("read", { path: "/a" })).toBe("A");
    expect(c.get("read", { path: "/b" })).toBe("B");
  });

  it("touch 累计 hop 计数,get 应能读取到 hops", () => {
    const c = new L1Cache(join(dir, "l1.json"));
    c.set("grep", { pattern: "x" }, ["hit"]);
    c.touch("grep", { pattern: "x" });
    c.touch("grep", { pattern: "x" });
    expect(c.hops("grep", { pattern: "x" })).toBe(2);
  });

  it("超 maxSize 时必须淘汰最旧 (LRU)", () => {
    const c = new L1Cache(join(dir, "l1.json"), 10);
    for (let i = 0; i < 12; i++) c.set("t", { i }, i);
    expect(c.get("t", { i: 0 })).toBeUndefined();
    expect(c.get("t", { i: 11 })).toBe(11);
  });

  it("clear 必须清空缓存", () => {
    const c = new L1Cache(join(dir, "l1.json"));
    c.set("read", { path: "/a" }, "A");
    c.clear();
    expect(c.get("read", { path: "/a" })).toBeUndefined();
  });
});
