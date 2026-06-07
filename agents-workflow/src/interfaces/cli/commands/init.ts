import { join } from "node:path";
import { ensureDir, writeFileAtomic, fileExists } from "../../../shared/fs-helpers.js";
import { writeYaml } from "../../../shared/yaml.js";
import { StateStore } from "../../../core/state/store.js";
import type { CliCommand, CliContext } from "../types.js";

function handler(ctx: CliContext): number {
  const yunshouRoot = join(ctx.cwd, ".yunshou");
  if (fileExists(yunshouRoot)) {
    ctx.stderr(`错误: 云枢已初始化在 ${yunshouRoot}\n`);
    return 1;
  }
  ensureDir(join(yunshouRoot, "specs"));
  ensureDir(join(yunshouRoot, "plans"));
  ensureDir(join(yunshouRoot, "memory", "l3"));
  ensureDir(join(yunshouRoot, "knowledge"));
  ensureDir(join(yunshouRoot, "tasks"));
  writeFileAtomic(
    join(yunshouRoot, "config.yaml"),
    writeYaml({
      version: "0.1.0",
      adapter: "opencode",
      createdAt: new Date().toISOString(),
    }),
  );
  const store = new StateStore(join(yunshouRoot, "events.jsonl"));
  store.append({ type: "spec.created", specId: "init", data: { kind: "init" } });
  ctx.stdout(`已初始化云枢工作区: ${yunshouRoot}\n`);
  return 0;
}

export const initCommand: CliCommand = {
  name: "init",
  description: "在当前目录初始化云枢工作区",
  handler,
};
