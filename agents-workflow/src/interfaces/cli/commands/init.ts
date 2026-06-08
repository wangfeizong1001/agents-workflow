// 模块职责: init 命令 —— 在当前目录创建 .yunshou/ 工作区并初始化内部
// 子目录结构(specs/plans/memory/knowledge/tasks)与 events.jsonl。
// 接口契约:
// - handler 在已初始化时抛出 YunShouError(CLI_INVALID_ARGS),由 runCli 统一捕获并输出。
// - 使用 yunshouPaths(ctx.cwd) 获取所有路径,不手写 join 路径。

import { existsSync } from "node:fs";
import { join } from "node:path";
import { ensureDir, writeFileAtomic } from "../../../shared/fs-helpers.js";
import { writeYaml } from "../../../shared/yaml.js";
import { YunShouError, YSErrorCode } from "../../../shared/errors.js";
import { yunshouPaths } from "../../../shared/path-helpers.js";
import { StateStore } from "../../../core/state/store.js";
import type { CliCommand, CliContext } from "../types.js";

function handler(ctx: CliContext): number {
  const p = yunshouPaths(ctx.cwd);
  if (existsSync(p.state)) {
    throw new YunShouError(`云枢已初始化在 ${p.state}`, YSErrorCode.CLI_INVALID_ARGS, { exitCode: 1, path: p.state });
  }
  ensureDir(p.specs);
  ensureDir(p.plans);
  ensureDir(join(p.memory, "l3"));
  ensureDir(p.knowledge);
  ensureDir(p.tasks);
  writeFileAtomic(
    join(p.state, "config.yaml"),
    writeYaml({
      version: "0.1.0",
      adapter: "opencode",
      createdAt: new Date().toISOString(),
    }),
  );
  const store = new StateStore(p.events);
  store.append({ type: "spec.created", specId: "init", data: { kind: "init" } });
  ctx.stdout(`已初始化云枢工作区: ${p.state}\n`);
  return 0;
}

export const initCommand: CliCommand = {
  name: "init",
  description: "在当前目录初始化云枢工作区",
  handler,
};
