import { existsSync } from "node:fs";
import { join } from "node:path";
import { yunshouPaths } from "../../../shared/path-helpers.js";
import { StateStore } from "../../../core/state/store.js";
import type { CliCommand, CliContext } from "../types.js";

function handler(ctx: CliContext): number {
  const p = yunshouPaths(ctx.cwd);
  if (!existsSync(p.state)) {
    ctx.stderr("错误: 未初始化。请先运行 `yunshou init`\n");
    return 2;
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
