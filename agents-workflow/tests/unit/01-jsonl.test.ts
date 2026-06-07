import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appendLine, readLines } from "../../src/shared/jsonl.js";
import { YunShouError } from "../../src/shared/errors.js";

let dir: string;
let file: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ys-jsonl-"));
  file = join(dir, "events.jsonl");
});

describe("jsonl 模块", () => {
  it("appendLine 必须以 \\n 结尾写入一行", () => {
    appendLine(file, { a: 1 });
    const txt = readFileSync(file, "utf-8");
    expect(txt).toBe('{"a":1}\n');
  });

  it("readLines 必须按行解析并跳过空行", () => {
    writeFileSync(file, '{"a":1}\n\n{"a":2}\n');
    const lines = readLines<{ a: number }>(file);
    expect(lines).toEqual([{ a: 1 }, { a: 2 }]);
  });

  it("readLines 遇到损坏行必须抛 JSONL_CORRUPTED 且包含行号", () => {
    writeFileSync(file, '{"a":1}\n{坏的\n{"a":3}\n');
    try {
      readLines(file);
      expect.fail("应当抛错");
    } catch (e) {
      expect(e).toBeInstanceOf(YunShouError);
      const err = e as YunShouError;
      expect(err.code).toBe("JSONL_CORRUPTED");
      expect(err.context).toMatchObject({ line: 2 });
    }
  });

  it("多次 appendLine 追加必须保证顺序与原子性", () => {
    for (let i = 0; i < 100; i++) appendLine(file, { i });
    const lines = readLines<{ i: number }>(file);
    expect(lines).toHaveLength(100);
    expect(lines[0]?.i).toBe(0);
    expect(lines[99]?.i).toBe(99);
  });
});
