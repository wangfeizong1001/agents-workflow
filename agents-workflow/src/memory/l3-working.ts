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
