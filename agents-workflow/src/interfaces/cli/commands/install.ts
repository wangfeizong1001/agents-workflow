// 模块职责: install 子命令 —— 安装 IDE 适配器到当前工作区。
//
// 接口契约:
//   - yunshou install opencode  : 写入 .opencode/ 适配器文件

import { installOpencode } from "../../../adapters/opencode/install.js";
import { YunShouError, YSErrorCode } from "../../../shared/errors.js";
import type { CliCommand, CliContext } from "../types.js";

function handler(ctx: CliContext): number {
  const subArgs = ctx.args.slice(1);
  const adapter = subArgs[0];

  if (!adapter || adapter === "--help" || adapter === "-h") {
    showInstallHelp(ctx);
    return 0;
  }

  switch (adapter) {
    case "opencode":
      installOpencode(ctx.cwd);
      ctx.stdout("已安装 OpenCode 适配器\n");
      return 0;
    default:
      throw new YunShouError(
        `不支持的适配器: ${adapter}`,
        YSErrorCode.ADAPTER_NOT_SUPPORTED,
        { adapter, supported: ["opencode"] },
      );
  }
}

function showInstallHelp(ctx: CliContext): void {
  ctx.stdout("用法:\n");
  ctx.stdout("  yunshou install opencode   安装 OpenCode 适配器\n");
}

export const installCommand: CliCommand = {
  name: "install",
  description: "安装 IDE 适配器 (v0.1: opencode)",
  handler,
};
