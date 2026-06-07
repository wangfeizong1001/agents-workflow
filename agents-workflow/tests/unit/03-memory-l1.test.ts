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

  // 关键契约补强: plan 14.1 的 5 个测试全是快乐路径,以下分支需要锁定。

  it("跨实例持久化恢复: 第二次 new L1Cache(sameFile) 必须能读到上次写入的 entry", () => {
    const file = join(dir, "l1.json");
    const c1 = new L1Cache(file);
    c1.set("read", { path: "/a" }, "A");
    c1.set("grep", { pattern: "x" }, ["hit"]);
    const c2 = new L1Cache(file);
    expect(c2.get("read", { path: "/a" })).toBe("A");
    expect(c2.get("grep", { pattern: "x" })).toEqual(["hit"]);
  });

  it("set 同 key 覆盖: value 更新, createdAt/hops 重置, lastUsedAt 也重置", () => {
    const c = new L1Cache(join(dir, "l1.json"));
    c.set("read", { path: "/a" }, "A");
    c.touch("read", { path: "/a" });
    c.touch("read", { path: "/a" });
    expect(c.hops("read", { path: "/a" })).toBe(2);
    c.set("read", { path: "/a" }, "A2");
    expect(c.get("read", { path: "/a" })).toBe("A2");
    // 覆盖后 hops 必须重置为 0 (plan 14.3 行为)
    expect(c.hops("read", { path: "/a" })).toBe(0);
  });

  it("touch 不存在的 key 必须是无操作, 不抛错也不创建 entry", () => {
    const c = new L1Cache(join(dir, "l1.json"));
    expect(() => c.touch("ghost", { x: 1 })).not.toThrow();
    expect(c.hops("ghost", { x: 1 })).toBe(0);
    expect(c.get("ghost", { x: 1 })).toBeUndefined();
  });

  it("LRU 满时 set 同 key: size 保持 maxSize, 原地刷新 (先淘汰最旧再写入)", () => {
    const c = new L1Cache(join(dir, "l1.json"), 2);
    c.set("t", { i: 0 }, "A");
    c.set("t", { i: 1 }, "B");
    // 满时 set 已存在 key 0: 触发淘汰 (A 是最旧的 T0) → 删 A → set 0=A2
    c.set("t", { i: 0 }, "A2");
    expect(c.get("t", { i: 0 })).toBe("A2");
    expect(c.get("t", { i: 1 })).toBe("B"); // B 仍在
  });
});
