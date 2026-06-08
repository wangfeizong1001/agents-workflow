import { uninstallOpencode } from "../../../adapters/opencode/uninstall.js";
import { uninstallClaudeCode } from "../../../adapters/claude-code/uninstall.js";
import { uninstallCursor } from "../../../adapters/cursor/uninstall.js";
import { uninstallTrae } from "../../../adapters/trae/uninstall.js";
import { uninstallCodebuddy } from "../../../adapters/codebuddy/uninstall.js";
import { YunShouError, YSErrorCode } from "../../../shared/errors.js";
import type { CliCommand, CliContext } from "../types.js";

const ADAPTERS = {
  opencode: { uninstall: uninstallOpencode, label: "OpenCode" },
  "claude-code": { uninstall: uninstallClaudeCode, label: "Claude Code" },
  cursor: { uninstall: uninstallCursor, label: "Cursor" },
  trae: { uninstall: uninstallTrae, label: "Trae" },
  codebuddy: { uninstall: uninstallCodebuddy, label: "CodeBuddy" },
} as const;

function handler(ctx: CliContext): number {
  const subArgs = ctx.args.slice(1);
  const adapter = subArgs[0];

  if (!adapter || adapter === "--help" || adapter === "-h") {
    showUninstallHelp(ctx);
    return 0;
  }

  if (adapter in ADAPTERS) {
    const a = ADAPTERS[adapter as keyof typeof ADAPTERS];
    a.uninstall(ctx.cwd);
    ctx.stdout(`已卸载 ${a.label} 适配器\n`);
    return 0;
  }

  throw new YunShouError(
    `不支持的适配器: ${adapter}`,
    YSErrorCode.ADAPTER_NOT_SUPPORTED,
    { adapter, supported: Object.keys(ADAPTERS) },
  );
}

function showUninstallHelp(ctx: CliContext): void {
  ctx.stdout("用法: yunshou uninstall <adapter>\n");
  ctx.stdout("可用适配器:\n");
  for (const [key, a] of Object.entries(ADAPTERS)) {
    ctx.stdout(`  ${key.padEnd(15)} ${a.label}\n`);
  }
}

export const uninstallCommand: CliCommand = {
  name: "uninstall",
  description: "卸载 IDE 适配器",
  handler,
};
