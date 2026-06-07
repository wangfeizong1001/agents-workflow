import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensureDir, writeFileAtomic, readText, fileExists } from "../../src/shared/fs-helpers.js";
import { YunShouError } from "../../src/shared/errors.js";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ys-fs-"));
});

describe("fs-helpers", () => {
  it("ensureDir 必须递归创建目录", () => {
    const p = join(dir, "a", "b", "c");
    ensureDir(p);
    expect(existsSync(p)).toBe(true);
  });

  it("writeFileAtomic 必须先写临时文件再重命名", () => {
    const p = join(dir, "x.txt");
    writeFileAtomic(p, "hello");
    expect(readFileSync(p, "utf-8")).toBe("hello");
  });

  it("writeFileAtomic 写入时若目标存在,先确保目录存在", () => {
    const p = join(dir, "deep", "y.txt");
    writeFileAtomic(p, "z");
    expect(existsSync(p)).toBe(true);
  });

  it("readText 对不存在的文件必须抛 FS_NOT_FOUND", () => {
    expect(() => readText(join(dir, "missing"))).toThrow(YunShouError);
    try {
      readText(join(dir, "missing"));
    } catch (e) {
      expect((e as YunShouError).code).toBe("FS_NOT_FOUND");
    }
  });

  it("fileExists 必须返回 boolean", () => {
    expect(fileExists(join(dir, "no"))).toBe(false);
    writeFileAtomic(join(dir, "yes"), "x");
    expect(fileExists(join(dir, "yes"))).toBe(true);
  });
});
