import { parse, stringify } from "yaml";
import { YunShouError, YSErrorCode } from "./errors.js";

export function readYaml<T>(src: string): T {
  try {
    return parse(src) as T;
  } catch (err) {
    throw new YunShouError(
      "YAML 解析失败",
      YSErrorCode.YAML_PARSE_FAILED,
      { length: src.length },
      err instanceof Error ? err : undefined,
    );
  }
}

export function writeYaml(obj: unknown): string {
  return stringify(obj, { indent: 2, lineWidth: 100 });
}

export function splitFrontmatter(raw: string): { meta: string; body: string } {
  if (!raw.startsWith("---")) return { meta: "", body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end < 0) return { meta: "", body: raw };
  const meta = raw.slice(3, end + 1).replace(/^\n/, "");
  const tail = raw.slice(end + 4);
  const body = tail.startsWith("\n") ? tail.slice(1) : tail;
  return { meta, body };
}
