// 模块职责: execute 子命令 —— 委托 ExecuteEngine 生成任务提示词与标记完成。
//
// 接口契约:
//   - yunshou execute next --plan-id <id>
//   - yunshou execute complete --plan-id <id> --task-id <id>

import { ExecuteEngine } from "../../../core/execute/engine.js";
import { StateStore } from "../../../core/state/store.js";
import { yunshouPaths } from "../../../shared/path-helpers.js";
import type { CliCommand, CliContext } from "../types.js";

function handler(ctx: CliContext): number {
  const subArgs = ctx.args.slice(1);
  const subCmd = subArgs[0];

  if (!subCmd || subCmd === "--help" || subCmd === "-h") {
    showExecHelp(ctx);
    return 0;
  }

  const p = yunshouPaths(ctx.cwd);

  if (subCmd === "next") {
    const opts = parseCliOptions(subArgs.slice(1));
    const planId = opts["plan-id"];
    if (!planId) {
      ctx.stderr("错误: 缺少必填选项 --plan-id\n");
      return 1;
    }
    const engine = new ExecuteEngine({ root: ctx.cwd, store: new StateStore(p.events) });
    const out = engine.nextPrompt(planId);
    if (!out) {
      ctx.stdout("无可执行任务\n");
      return 0;
    }
    ctx.stdout(`任务 ${out.taskId} 的提示词已写入: ${out.promptFile}\n`);
    return 0;
  }

  if (subCmd === "complete") {
    const opts = parseCliOptions(subArgs.slice(1));
    const planId = opts["plan-id"];
    const taskId = opts["task-id"];
    if (!planId || !taskId) {
      ctx.stderr("错误: 缺少必填选项 --plan-id 或 --task-id\n");
      return 1;
    }
    const engine = new ExecuteEngine({ root: ctx.cwd, store: new StateStore(p.events) });
    engine.completeTask(planId, taskId);
    ctx.stdout(`已标记 ${taskId} 完成\n`);
    return 0;
  }

  ctx.stderr(`错误: 未知子命令 "${subCmd}"。运行 \`yunshou execute --help\` 查看用法\n`);
  return 1;
}

function showExecHelp(ctx: CliContext): void {
  ctx.stdout("用法:\n");
  ctx.stdout("  yunshou execute next --plan-id <id>\n");
  ctx.stdout("  yunshou execute complete --plan-id <id> --task-id <id>\n");
}

function parseCliOptions(args: readonly string[]): Record<string, string> {
  const opts: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (key?.startsWith("--")) {
      const name = key.slice(2);
      const val = args[i + 1];
      if (val !== undefined && !val.startsWith("--")) {
        opts[name] = val;
        i++;
      }
    }
  }
  return opts;
}

export const executeCommand: CliCommand = {
  name: "execute",
  description: "执行管理 (next / complete)",
  handler,
};
