import { installOpencode } from "../../../adapters/opencode/install.js";
import { installClaudeCode } from "../../../adapters/claude-code/install.js";
import { installCursor } from "../../../adapters/cursor/install.js";
import { installTrae } from "../../../adapters/trae/install.js";
import { installCodebuddy } from "../../../adapters/codebuddy/install.js";
import { YunShouError, YSErrorCode } from "../../../shared/errors.js";
import type { CliCommand, CliContext } from "../types.js";

const ADAPTERS = {
  opencode: { install: installOpencode, label: "OpenCode" },
  "claude-code": { install: installClaudeCode, label: "Claude Code" },
  cursor: { install: installCursor, label: "Cursor" },
  trae: { install: installTrae, label: "Trae" },
  codebuddy: { install: installCodebuddy, label: "CodeBuddy" },
} as const;

function handler(ctx: CliContext): number {
  const subArgs = ctx.args.slice(1);
  const adapter = subArgs[0];

  if (!adapter || adapter === "--help" || adapter === "-h") {
    showInstallHelp(ctx);
    return 0;
  }

  if (adapter in ADAPTERS) {
    const a = ADAPTERS[adapter as keyof typeof ADAPTERS];
    a.install(ctx.cwd);
    ctx.stdout(`已安装 ${a.label} 适配器\n`);
    return 0;
  }

  throw new YunShouError(
    `不支持的适配器: ${adapter}`,
    YSErrorCode.ADAPTER_NOT_SUPPORTED,
    { adapter, supported: Object.keys(ADAPTERS) },
  );
}

function showInstallHelp(ctx: CliContext): void {
  ctx.stdout("用法: yunshou install <adapter>\n");
  ctx.stdout("可用适配器:\n");
  for (const [key, a] of Object.entries(ADAPTERS)) {
    ctx.stdout(`  ${key.padEnd(15)} ${a.label}\n`);
  }
}

export const installCommand: CliCommand = {
  name: "install",
  description: "安装 IDE 适配器",
  handler,
};
