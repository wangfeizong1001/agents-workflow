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
import { specCommand } from "./commands/spec.js";
import { planCommand } from "./commands/plan.js";
import { executeCommand } from "./commands/execute.js";
import { verifyCommand } from "./commands/verify.js";
import { installCommand } from "./commands/install.js";
import { uninstallCommand } from "./commands/uninstall.js";
import { workflowCommand } from "./commands/workflow.js";
import { skillsCommand } from "./commands/skills.js";
import { agentsCmdCommand } from "./commands/agents-cmd.js";
import type { CliCommand, CliContext } from "./types.js";
import { EXIT_OK } from "./types.js";
import { VERSION } from "../../index.js";
import { YunShouError } from "../../shared/errors.js";

const MCP_COMMAND: CliCommand = {
  name: "mcp",
  description: "启动 MCP 服务器。默认 stdio; --transport ws|sse --port 3100",
  handler: () => 0,
};

const WATCH_COMMAND: CliCommand = {
  name: "watch",
  description: "监视 .yunshou/ 文件变更并自动触发验证",
  handler: () => 0,
};

// 子命令注册表 — 手写 dispatch 的单一事实源
// 后续任务 18+ (spec/plan/execute/verify 子命令) 在此追加即可
const COMMANDS = {
  [initCommand.name]: initCommand,
  [statusCommand.name]: statusCommand,
  [specCommand.name]: specCommand,
  [planCommand.name]: planCommand,
  [executeCommand.name]: executeCommand,
  [verifyCommand.name]: verifyCommand,
  [installCommand.name]: installCommand,
  [uninstallCommand.name]: uninstallCommand,
  [workflowCommand.name]: workflowCommand,
  [skillsCommand.name]: skillsCommand,
  [agentsCmdCommand.name]: agentsCmdCommand,
  [MCP_COMMAND.name]: MCP_COMMAND,
  [WATCH_COMMAND.name]: WATCH_COMMAND,
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

  // watch 子命令: 文件监视
  if (sub === "watch") {
    ctx.stdout("云枢文件监视器已启动 (Ctrl+C 停止)\n");
    const { FileWatcher } = await import("../../watcher/index.js");
    const w = new FileWatcher(cwd);
    w.watch(["events.jsonl"], (events) => {
      for (const e of events) {
        ctx.stdout(`  [${e.type}] ${e.filePath}\n`);
      }
    });
    // 保持进程运行
    await new Promise(() => {});
    return EXIT_OK;
  }

  // mcp 子命令特殊处理: 长期阻塞的服务器 (stdio / ws / sse)
  if (sub === "mcp") {
    const subArgs = args.slice(1);
    const transportFlag = subArgs.indexOf("--transport");
    const portFlag = subArgs.indexOf("--port");
    const transport = transportFlag !== -1 && subArgs[transportFlag + 1] ? subArgs[transportFlag + 1] : "stdio";
    const port = portFlag !== -1 && subArgs[portFlag + 1] ? Number(subArgs[portFlag + 1]) : 3100;

    if (transport === "ws") {
      const { createWebSocketServer } = await import("../../mcp/ws-transport.js");
      await createWebSocketServer(cwd, port);
    } else if (transport === "sse") {
      const { createSSEServer } = await import("../../mcp/sse-transport.js");
      await createSSEServer(cwd, port);
    } else {
      const { runMcp } = await import("../mcp/server.js");
      await runMcp(cwd);
    }
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
