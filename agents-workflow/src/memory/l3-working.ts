// 云枢 Memory L3 —— 跨阶段工作记忆快照。
//
// 与 L1 (本轮内工具结果缓存) 的区别:
//   - L1 是 K/V 缓存, 关心"同 (tool, args) 别重复跑"
//   - L3 是顺序追加的快照日志, 关心"spec→plan→execute→verify 阶段间的关键决策"
//
// 提供 snapshot / load / latest 三个 API,持久化到 .yunshou/memory/l3/。
//
// 选型:
//   - 单文件 YAML: { id, label, ts, payload }, 一次写入一文件, 简单可靠
//   - id 策略: ${Date.now()}-${randomUUID().slice(0,6)}
//     Date.now 保证时间序前缀, 6 位 uuid hex (24 bit) 防止同毫秒碰撞
//   - latest: 按文件名字典序取末尾, 等价于时间序末尾 (id 前缀 Date.now 已字典序)
//
// 持久化格式: { id, label, ts, payload } (单层 YAML 容器)
// 原子写入: writeFileAtomic (阶段 1 任务 7) 保证崩溃一致性
//
// 已知局限 (plan 15.2 行为, 留到后续任务扩展):
//   - 无 list() / delete() / prune() — 目录会随时间无限增长
//   - load 返回 unknown (丢失 label/ts 元数据)
//   - load 失败时 readText 裸抛 ENOENT, 未包 YunShouError
//   这些缺口由阶段 4 spec-guard 接入时按需补强, 不在本任务范围。

import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { readdirSync } from "node:fs";
import { writeFileAtomic, ensureDir, readText } from "../shared/fs-helpers.js";
import { readYaml, writeYaml } from "../shared/yaml.js";

export class L3Working {
  constructor(private readonly yunshouRoot: string) {}

  private dir(): string {
    return join(this.yunshouRoot, "memory", "l3");
  }

  public snapshot(label: string, payload: unknown): string {
    ensureDir(this.dir());
    const id = `${Date.now()}-${randomUUID().slice(0, 6)}`;
    const data = { id, label, ts: new Date().toISOString(), payload };
    writeFileAtomic(join(this.dir(), `${id}.yaml`), writeYaml(data));
    return id;
  }

  public load(id: string): unknown {
    const raw = readText(join(this.dir(), `${id}.yaml`));
    return readYaml<{ payload: unknown }>(raw).payload;
  }

  public latest(): string | undefined {
    const dir = this.dir();
    const files = readdirSync(dir)
      .filter((f) => f.endsWith(".yaml"))
      .sort();
    const last = files.at(-1);
    if (!last) return undefined;
    return last.replace(/\.yaml$/, "");
  }
}
