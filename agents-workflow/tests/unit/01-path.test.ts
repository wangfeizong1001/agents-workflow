import { describe, it, expect } from "vitest";
import { yunshouPaths, toRelative, toAbsolute, isInside } from "../../src/shared/path-helpers.js";
import { join } from "node:path";

describe("path-helpers", () => {
  it("yunshouPaths 必须返回云枢工作区的固定路径集", () => {
    const root = "/tmp/proj";
    const p = yunshouPaths(root);
    expect(p.root).toBe(root);
    expect(p.state).toBe(join(root, ".yunshou"));
    expect(p.events).toBe(join(root, ".yunshou", "events.jsonl"));
    expect(p.specs).toBe(join(root, ".yunshou", "specs"));
    expect(p.plans).toBe(join(root, ".yunshou", "plans"));
    expect(p.memory).toBe(join(root, ".yunshou", "memory"));
  });

  it("toRelative 必须将绝对路径转为相对 cwd 的 POSIX 风格", () => {
    const cwd = "/tmp/proj";
    expect(toRelative("/tmp/proj/a/b.md", cwd)).toBe("a/b.md");
  });

  it("toAbsolute 必须将相对路径解析为绝对路径", () => {
    expect(toAbsolute("a/b", "/tmp/proj")).toBe("/tmp/proj/a/b");
  });

  it("isInside 必须判断 child 是否在 parent 之下", () => {
    expect(isInside("/tmp/proj/a", "/tmp/proj")).toBe(true);
    expect(isInside("/tmp/proj", "/tmp/proj/a")).toBe(false);
    expect(isInside("/etc/passwd", "/tmp/proj")).toBe(false);
  });
});
