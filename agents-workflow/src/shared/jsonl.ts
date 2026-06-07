import { appendFileSync, readFileSync } from "node:fs";
import { YunShouError, YSErrorCode } from "./errors.js";

export function appendLine(path: string, value: unknown): void {
  try {
    appendFileSync(path, `${JSON.stringify(value)}\n`, "utf-8");
  } catch (err) {
    throw new YunShouError(
      "JSONL 追加失败",
      YSErrorCode.FS_WRITE_FAILED,
      { path },
      err instanceof Error ? err : undefined,
    );
  }
}

export function readLines<T = unknown>(path: string): readonly T[] {
  let raw: string;
  try {
    raw = readFileSync(path, "utf-8");
  } catch (err) {
    throw new YunShouError(
      "JSONL 读取失败",
      YSErrorCode.FS_READ_FAILED,
      { path },
      err instanceof Error ? err : undefined,
    );
  }

  const out: T[] = [];
  const lines = raw.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === undefined || line === "") continue;
    try {
      out.push(JSON.parse(line) as T);
    } catch (err) {
      throw new YunShouError(
        "JSONL 行解析失败",
        YSErrorCode.JSONL_CORRUPTED,
        { path, line: i + 1, content: line },
        err instanceof Error ? err : undefined,
      );
    }
  }
  return out;
}
