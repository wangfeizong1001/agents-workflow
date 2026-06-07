import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { YunShouError, YSErrorCode } from "./errors.js";

export function ensureDir(path: string): void {
  try {
    mkdirSync(path, { recursive: true });
  } catch (err) {
    throw new YunShouError(
      "创建目录失败",
      YSErrorCode.FS_WRITE_FAILED,
      { path },
      err instanceof Error ? err : undefined,
    );
  }
}

export function writeFileAtomic(path: string, content: string): void {
  ensureDir(dirname(path));
  const tmp = join(dirname(path), `.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`);
  try {
    writeFileSync(tmp, content, "utf-8");
    renameSync(tmp, path);
  } catch (err) {
    throw new YunShouError(
      "原子写入失败",
      YSErrorCode.FS_WRITE_FAILED,
      { path, tmp },
      err instanceof Error ? err : undefined,
    );
  }
}

export function readText(path: string): string {
  if (!existsSync(path)) {
    throw new YunShouError(
      "文件不存在",
      YSErrorCode.FS_NOT_FOUND,
      { path },
    );
  }
  try {
    return readFileSync(path, "utf-8");
  } catch (err) {
    throw new YunShouError(
      "读取文件失败",
      YSErrorCode.FS_READ_FAILED,
      { path },
      err instanceof Error ? err : undefined,
    );
  }
}

export function fileExists(path: string): boolean {
  return existsSync(path);
}
