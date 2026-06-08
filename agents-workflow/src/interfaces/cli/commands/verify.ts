// 模块职责: verify 子命令 —— 运行 5 层验证并输出报告。
//
// 接口契约:
//   - yunshou verify all   : 运行全部 5 层验证
//   - yunshou verify report: 输出 JSON 格式验证报告

import { VerifyEngine } from "../../../core/verify/engine.js";
import type { CliCommand, CliContext } from "../types.js";

function handler(ctx: CliContext): Promise<number> {
  const subArgs = ctx.args.slice(1);
  const subCmd = subArgs[0];

  if (!subCmd || subCmd === "--help" || subCmd === "-h") {
    showVerifyHelp(ctx);
    return Promise.resolve(0);
  }

  if (subCmd === "all") {
    return handleAll(ctx);
  }

  if (subCmd === "report") {
    return handleReport(ctx);
  }

  ctx.stderr(`错误: 未知子命令 "${subCmd}"。运行 \`yunshou verify --help\` 查看用法\n`);
  return Promise.resolve(1);
}

async function handleAll(ctx: CliContext): Promise<number> {
  const engine = new VerifyEngine({ root: ctx.cwd });
  const report = await engine.runAll();
  for (const l of report.layers) {
    ctx.stdout(`  [${l.passed ? "PASS" : "FAIL"}] ${l.name} (${l.durationMs}ms)\n`);
  }
  return report.overall ? 0 : 1;
}

async function handleReport(ctx: CliContext): Promise<number> {
  const engine = new VerifyEngine({ root: ctx.cwd });
  const report = await engine.runAll();
  ctx.stdout(`${JSON.stringify(report, null, 2)}\n`);
  return 0;
}

function showVerifyHelp(ctx: CliContext): void {
  ctx.stdout("用法:\n");
  ctx.stdout("  yunshou verify all      运行全部 5 层验证\n");
  ctx.stdout("  yunshou verify report   输出 JSON 格式验证报告\n");
}

export const verifyCommand: CliCommand = {
  name: "verify",
  description: "运行 5 层验证 (all / report)",
  handler,
};
