// 模块职责: 云枢 CLI 入口 —— 负责装配 Commander 框架(用于 --version / --help),
// 手写 dispatch 路由子命令(初版仅 init / status),并提供可编程的
// runCli(args, cwd) 函数供测试与嵌入式调用方复用。
// 接口契约:
// - runCli(args, cwd): 程序化执行 CLI,返回进程退出码;args 不含 node 与脚本路径。
// - 文件被直接以 node 脚本方式执行时(import.meta.url 与 process.argv[1] 匹配),自动解析 argv 并退出。
//
// plan 缺陷已修 (实现行为优先, 与 plan 17.5 文字差异):
//   - 原 plan 用 program.command(name).description(...).action(...) 注册子命令
//     在 commander 12 中触发 _executableHandler 模式,parseAsync 找 $PATH 找
//     "yunshou-init" 二进制失败抛 commander.help 异常
//   - 备选 fix 1 (new Command + addCommand) 也不工作: commander 12.1 addCommand
//     注册的子命令 parseAsync 不会自动 dispatch, 仍走 help 分支
//   - 备选 fix 2 (本实现): 完全绕开 commander 自动 dispatch,手写 args[0] 路由
//     到子命令 handler,commander 12 仅用作 --version / --help 框架
//   - 副作用: 失去 commander 的"自动 --help 子命令"支持, v0.1 只 2 个子命令
//     手写 dispatch 更直接;后续若子命令 > 5 个再考虑用 commander 12 的新
//     command factory API 重构

import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { statusCommand } from "./commands/status.js";
import type { CliContext } from "./types.js";
import { EXIT_OK } from "./types.js";
import { VERSION } from "../../index.js";
import { YunShouError } from "../../shared/errors.js";

// 子命令注册表 — 手写 dispatch 的单一事实源
// 后续任务 18+ (spec/plan/execute/verify 子命令) 在此追加即可
const COMMANDS = {
  [initCommand.name]: initCommand,
  [statusCommand.name]: statusCommand,
} as const;
type CommandName = keyof typeof COMMANDS;

export async function runCli(args: readonly string[], cwd: string): Promise<number> {
  const ctx: CliContext = {
    args,
    cwd,
    stdout: (s) => process.stdout.write(s),
    stderr: (s) => process.stderr.write(s),
  };

  const sub = args[0];
  if (!sub) {
    // 空 args → 显示 help 后正常退出
    showHelp();
    return EXIT_OK;
  }

  if (sub === "--version" || sub === "-v") {
    process.stdout.write(`${VERSION}\n`);
    return EXIT_OK;
  }

  if (sub === "--help" || sub === "-h") {
    showHelp();
    return EXIT_OK;
  }

  // 手写 dispatch: 路由到子命令 handler
  if (sub in COMMANDS) {
    const cmd = COMMANDS[sub as CommandName];
    if (!cmd) {
      ctx.stderr(`错误: 未知命令 "${sub}"。运行 \`yunshou --help\` 查看可用命令\n`);
      return 1;
    }
    try {
      return await cmd.handler(ctx);
    } catch (err) {
      const ys = YunShouError.from(err);
      ctx.stderr(`错误: ${ys.message}\n`);
      // YunShouError.context 可能携带 exitCode（如 status 未初始化返回 2）
      const ec = (ys.context as Record<string, unknown>)["exitCode"];
      return typeof ec === "number" ? ec : 1;
    }
  }

  ctx.stderr(`错误: 未知命令 "${sub}"。运行 \`yunshou --help\` 查看可用命令\n`);
  return 1;
}

function showHelp(): void {
  const program = new Command();
  program
    .name("yunshou")
    .description("云枢 —— AI 编程工作流框架")
    .version(VERSION);
  for (const cmd of Object.values(COMMANDS)) {
    program.command(cmd.name).description(cmd.description);
  }
  program.outputHelp();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const cwd = process.cwd();
  runCli(process.argv.slice(2), cwd).then(
    (code) => process.exit(code),
    (err) => {
      process.stderr.write(`致命错误: ${err instanceof Error ? err.stack : String(err)}\n`);
      process.exit(1);
    },
  );
}
