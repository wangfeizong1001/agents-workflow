// 模块职责: uninstall 子命令 —— 卸载 IDE 适配器。
//
// 接口契约:
//   - yunshou uninstall opencode  : 清理 .opencode/ 下生成的文件

import { uninstallOpencode } from "../../../adapters/opencode/uninstall.js";
import { YunShouError, YSErrorCode } from "../../../shared/errors.js";
import type { CliCommand, CliContext } from "../types.js";

function handler(ctx: CliContext): number {
  const subArgs = ctx.args.slice(1);
  const adapter = subArgs[0];

  if (!adapter || adapter === "--help" || adapter === "-h") {
    showUninstallHelp(ctx);
    return 0;
  }

  switch (adapter) {
    case "opencode":
      uninstallOpencode(ctx.cwd);
      ctx.stdout("已卸载 OpenCode 适配器\n");
      return 0;
    default:
      throw new YunShouError(
        `不支持的适配器: ${adapter}`,
        YSErrorCode.ADAPTER_NOT_SUPPORTED,
        { adapter, supported: ["opencode"] },
      );
  }
}

function showUninstallHelp(ctx: CliContext): void {
  ctx.stdout("用法:\n");
  ctx.stdout("  yunshou uninstall opencode   卸载 OpenCode 适配器\n");
}

export const uninstallCommand: CliCommand = {
  name: "uninstall",
  description: "卸载 IDE 适配器",
  handler,
};
