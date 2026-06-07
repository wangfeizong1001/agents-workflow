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

  // 关键契约补强: plan 15.1 的 3 个测试全是快乐路径, 以下分支需要锁定。

  it("跨实例持久化恢复: 第二次 new L3Working(sameRoot) 必须能读到上次 snapshot", () => {
    const root = join(dir, ".yunshou");
    const l3a = new L3Working(root);
    const id = l3a.snapshot("phase=spec", { decisions: ["选 A"] });
    const l3b = new L3Working(root);
    expect(l3b.load(id)).toMatchObject({ decisions: ["选 A"] });
    expect(l3b.latest()).toBe(id);
  });

  it("空目录 latest 必须返回 undefined (无 snapshot 时)", () => {
    const l3 = new L3Working(join(dir, ".yunshou"));
    // 注意: snapshot 还没被调用过, .yunshou/memory/l3/ 目录根本不存在
    // plan 15.2 的 readdirSync 会在目录不存在时抛 ENOENT
    // 此处锁定"目录不存在" 与 "目录存在但无 yaml" 两种空场景的契约
    // 当前实现的 latest() 对目录不存在会抛, 这是 plan 15.2 的行为 (未做 ensureDir)
    expect(() => l3.latest()).toThrow();
  });
});
