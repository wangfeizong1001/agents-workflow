// 云枢 Memory L1 —— 工具结果缓存 (本轮内,3 跳去重)。
//
// 提供按 (tool, args) hash 为 key 的 K/V 缓存,带 hop 计数与 LRU 淘汰。
// 持久化到 YAML 文件,跨进程可恢复。
//
// 选型:
//   - key: SHA-256(tool + "::" + JSON.stringify(args)) 取前 16 字符 hex
//     碰撞概率 ~2^-64, 远小于 LRU 淘汰周期, 可接受
//   - 淘汰: 按 lastUsedAt 升序淘汰最旧 (LRU 简化版)
//   - hop 计数: touch() 自增, hops() 读取, 用于"同 key 被多次引用"的记忆信号
//
// 持久化格式: { entries: L1Entry[] }
// 原子写入: writeFileAtomic (阶段 1 任务 7) 保证崩溃一致性
//
// 语义细节 (plan 14.3 行为锁定):
//   - get 修改 lastUsedAt 但不 flush (LRU 淘汰时按内存中最新值)
//   - touch 改 hops + lastUsedAt 后立即 flush
//   - set 覆盖同 key 时重置 createdAt/lastUsedAt/hops
//   - LRU 满时 set 已存在 key,先淘汰一个最旧再写入,最终 size 不变

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
