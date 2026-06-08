// 模块职责: plan 子命令 —— 委托 PlanEngine 创建计划与查询下一个任务。
//
// 接口契约:
//   - yunshou plan create --id <id> --title <title> --spec-id <specId> --from <file>
//   - yunshou plan next --id <planId>
//
// 与 spec.ts 相同的手写 dispatch 模式, 不依赖 commander 12 dispatch。

import { readFileSync } from "node:fs";
import { PlanEngine } from "../../../core/plan/engine.js";
import { StateStore } from "../../../core/state/store.js";
import { yunshouPaths } from "../../../shared/path-helpers.js";
import type { CliCommand, CliContext } from "../types.js";

function handler(ctx: CliContext): number {
  const subArgs = ctx.args.slice(1);
  const subCmd = subArgs[0];

  if (!subCmd || subCmd === "--help" || subCmd === "-h") {
    showPlanHelp(ctx);
    return 0;
  }

  const p = yunshouPaths(ctx.cwd);

  if (subCmd === "create") {
    const opts = parseCliOptions(subArgs.slice(1));
    const id = opts["id"];
    const title = opts["title"];
    const specId = opts["spec-id"];
    const from = opts["from"];
    if (!id || !title || !specId || !from) {
      ctx.stderr("错误: 缺少必填选项 --id / --title / --spec-id / --from\n");
      return 1;
    }
    const markdown = readFileSync(from, "utf-8");
    const engine = new PlanEngine({ root: ctx.cwd, store: new StateStore(p.events) });
    const pid = engine.create({ id, title, specId, markdown });
    ctx.stdout(`已创建计划 ${pid}, 任务数: ${engine.tasks(pid).length}\n`);
    return 0;
  }

  if (subCmd === "next") {
    const opts = parseCliOptions(subArgs.slice(1));
    const planId = opts["id"];
    if (!planId) {
      ctx.stderr("错误: 缺少必填选项 --id\n");
      return 1;
    }
    const engine = new PlanEngine({ root: ctx.cwd, store: new StateStore(p.events) });
    const t = engine.nextTask(planId);
    if (!t) {
      ctx.stdout("无可执行任务\n");
      return 0;
    }
    ctx.stdout(`下一个任务: ${t.id} — ${t.title}\n`);
    for (const b of t.bullets) ctx.stdout(`  - ${b}\n`);
    return 0;
  }

  ctx.stderr(`错误: 未知子命令 "${subCmd}"。运行 \`yunshou plan --help\` 查看用法\n`);
  return 1;
}

function showPlanHelp(ctx: CliContext): void {
  ctx.stdout("用法:\n");
  ctx.stdout("  yunshou plan create --id <id> --title <title> --spec-id <specId> --from <file>\n");
  ctx.stdout("  yunshou plan next --id <planId>\n");
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

export const planCommand: CliCommand = {
  name: "plan",
  description: "计划管理 (create / next)",
  handler,
};
