// 模块职责: status 命令 —— 读取当前 .yunshou/ 工作区的 events.jsonl
// 并统计各事件类型数量,输出简要工作区概览。
// 接口契约:
// - handler 在未初始化时抛出 YunShouError(CLI_INVALID_ARGS, exitCode=2),
//   由 runCli 统一捕获并输出。

import { existsSync } from "node:fs";
import { yunshouPaths } from "../../../shared/path-helpers.js";
import { StateStore } from "../../../core/state/store.js";
import { YunShouError, YSErrorCode } from "../../../shared/errors.js";
import type { CliCommand, CliContext } from "../types.js";

function handler(ctx: CliContext): number {
  const p = yunshouPaths(ctx.cwd);
  if (!existsSync(p.state)) {
    throw new YunShouError("未初始化。请先运行 `yunshou init`", YSErrorCode.CLI_INVALID_ARGS, { exitCode: 2, cwd: ctx.cwd });
  }
  const store = new StateStore(p.events);
  const events = store.read();
  const byType = new Map<string, number>();
  for (const e of events) {
    byType.set(e.type, (byType.get(e.type) ?? 0) + 1);
  }
  ctx.stdout("云枢工作区状态\n");
  ctx.stdout(`  路径: ${p.state}\n`);
  ctx.stdout(`  事件总数: ${events.length}\n`);
  for (const [t, n] of [...byType.entries()].sort()) {
    ctx.stdout(`    ${t}: ${n}\n`);
  }
  return 0;
}

export const statusCommand: CliCommand = {
  name: "status",
  description: "查看当前云枢工作区状态",
  handler,
};
