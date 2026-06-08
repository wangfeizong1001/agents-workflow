// 模块职责: L7 跨会话交接 —— 在 handoff.yaml 中保存/读取交接负载。
//
// 接口契约:
//   - L7Handoff(yunshouRoot): 操作 .yunshou/memory/l7/handoff.yaml
//   - write(payload): 写入手写负载 + writtenAt 时间戳
//   - read(): 读取负载,不存在时返回 undefined

import { join } from "node:path";
import { writeFileAtomic, readText, fileExists, ensureDir } from "../shared/fs-helpers.js";
import { writeYaml, readYaml } from "../shared/yaml.js";

export interface HandoffPayload {
  readonly summary: string;
  readonly next: string;
  readonly blockers?: readonly string[];
  readonly links?: Readonly<Record<string, string>>;
}

export class L7Handoff {
  private readonly path: string;

  constructor(yunshouRoot: string) {
    const dir = join(yunshouRoot, "memory", "l7");
    ensureDir(dir);
    this.path = join(dir, "handoff.yaml");
  }

  public write(payload: HandoffPayload): void {
    writeFileAtomic(this.path, writeYaml({ ...payload, writtenAt: new Date().toISOString() }));
  }

  public read(): HandoffPayload | undefined {
    if (!fileExists(this.path)) return undefined;
    return readYaml<HandoffPayload>(readText(this.path));
  }
}
