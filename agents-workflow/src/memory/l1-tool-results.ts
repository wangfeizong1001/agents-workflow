import { createHash } from "node:crypto";
import { writeFileAtomic, readText, fileExists } from "../shared/fs-helpers.js";
import { readYaml, writeYaml } from "../shared/yaml.js";
import type { L1Entry } from "./types.js";

function hashOf(tool: string, args: Readonly<Record<string, unknown>>): string {
  return createHash("sha256")
    .update(`${tool}::${JSON.stringify(args)}`)
    .digest("hex")
    .slice(0, 16);
}

export class L1Cache {
  private entries: Map<string, L1Entry>;

  constructor(
    private readonly file: string,
    private readonly maxSize = 1000,
  ) {
    this.entries = new Map();
    if (fileExists(file)) {
      const data = readYaml<{ entries?: L1Entry[] }>(readText(file));
      for (const e of data.entries ?? []) this.entries.set(e.key, e);
    }
  }

  public get(tool: string, args: Readonly<Record<string, unknown>>): unknown {
    const key = hashOf(tool, args);
    const e = this.entries.get(key);
    if (!e) return undefined;
    e.lastUsedAt = new Date().toISOString();
    return e.value;
  }

  public set(
    tool: string,
    args: Readonly<Record<string, unknown>>,
    value: unknown,
  ): void {
    if (this.entries.size >= this.maxSize) {
      const sorted = [...this.entries.values()].sort((a, b) =>
        a.lastUsedAt.localeCompare(b.lastUsedAt),
      );
      const oldest = sorted[0];
      if (oldest) this.entries.delete(oldest.key);
    }
    const key = hashOf(tool, args);
    this.entries.set(key, {
      key,
      tool,
      args,
      value,
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
      hops: 0,
    });
    this.flush();
  }

  public touch(tool: string, args: Readonly<Record<string, unknown>>): void {
    const key = hashOf(tool, args);
    const e = this.entries.get(key);
    if (e) {
      e.hops += 1;
      e.lastUsedAt = new Date().toISOString();
      this.flush();
    }
  }

  public hops(tool: string, args: Readonly<Record<string, unknown>>): number {
    const key = hashOf(tool, args);
    return this.entries.get(key)?.hops ?? 0;
  }

  public clear(): void {
    this.entries.clear();
    this.flush();
  }

  private flush(): void {
    writeFileAtomic(this.file, writeYaml({ entries: [...this.entries.values()] }));
  }
}
