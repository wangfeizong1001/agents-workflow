import { existsSync } from "node:fs";
import { yunshouPaths } from "../../../shared/path-helpers.js";
import { StateStore } from "../../../core/state/store.js";
import { YunShouError, YSErrorCode } from "../../../shared/errors.js";
import { adapterStatus as opencodeStatus } from "../../../adapters/opencode/status.js";
import { claudeCodeStatus } from "../../../adapters/claude-code/status.js";
import { cursorStatus } from "../../../adapters/cursor/status.js";
import { traeStatus } from "../../../adapters/trae/status.js";
import { codebuddyStatus } from "../../../adapters/codebuddy/status.js";
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
  ctx.stdout("  适配器状态:\n");
  const adapters = [
    { name: "opencode", status: opencodeStatus(ctx.cwd) },
    { name: "claude-code", status: claudeCodeStatus(ctx.cwd) },
    { name: "cursor", status: cursorStatus(ctx.cwd) },
    { name: "trae", status: traeStatus(ctx.cwd) },
    { name: "codebuddy", status: codebuddyStatus(ctx.cwd) },
  ];
  for (const a of adapters) {
    ctx.stdout(`    ${a.name.padEnd(15)} ${a.status.installed ? "✅ 已安装" : "❌ 未安装"}\n`);
  }
  return 0;
}

export const statusCommand: CliCommand = {
  name: "status",
  description: "查看当前云枢工作区状态",
  handler,
};
