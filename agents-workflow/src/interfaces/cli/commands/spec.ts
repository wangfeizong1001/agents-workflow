// 模块职责: spec 子命令 —— 委托 SpecEngine 进行规格的创建与阶段推进。
//
// 接口契约:
//   - yunshou spec create --id <id> --title <title> --date <date>
//     --author <author> --problem <text> --goal <text>
//     --non-goals <text> --decisions <text> --scenarios <text>
//     --risks <text>
//   - yunshou spec advance --id <id> --to <phase>
//   --to 必须是 review / approved / archived 之一。
//
// 架构决策:
//   不依赖 commander 做子命令 dispatch (commander 12 的 _executableHandler
//   模式兼容问题, 见 index.ts plan 缺陷注释)。
//   手写 parseCliOptions 从 args 中提取 --key value 对, 简单可预测。

import { join } from "node:path";
import { SpecEngine } from "../../../core/spec/engine.js";
import { StateStore } from "../../../core/state/store.js";
import { YunShouError, YSErrorCode } from "../../../shared/errors.js";
import { yunshouPaths } from "../../../shared/path-helpers.js";
import type { CliCommand, CliContext } from "../types.js";

const REQUIRE_CREATE = [
  "id", "title", "date", "author",
  "problem", "goal", "non-goals",
  "decisions", "scenarios", "risks",
] as const;

function handler(ctx: CliContext): number {
  const subArgs = ctx.args.slice(1); // ["create", "--id", "s1", ...]
  const subCmd = subArgs[0];

  if (!subCmd || subCmd === "--help" || subCmd === "-h") {
    showSpecHelp(ctx);
    return 0;
  }

  const p = yunshouPaths(ctx.cwd);

  if (subCmd === "create") {
    const opts = parseCliOptions(subArgs.slice(1));
    for (const r of REQUIRE_CREATE) {
      if (!opts[r]) {
        ctx.stderr(`错误: 缺少必填选项 --${r}\n`);
        return 1;
      }
    }
    // 上方 REQUIRE_CREATE 循环已保证 opts 中各字段非空, ! 断言安全
    const engine = new SpecEngine({ root: ctx.cwd, store: new StateStore(p.events) });
    const id = engine.create({
      id: opts["id"]!,
      title: opts["title"]!,
      date: opts["date"]!,
      author: opts["author"]!,
      problem: opts["problem"]!,
      goal: opts["goal"]!,
      nonGoals: opts["non-goals"]!,
      decisions: opts["decisions"]!,
      scenarios: opts["scenarios"]!,
      risks: opts["risks"]!,
    });
    ctx.stdout(`已创建规格 ${id}\n`);
    return 0;
  }

  if (subCmd === "advance") {
    const opts = parseCliOptions(subArgs.slice(1));
    const id = opts["id"];
    const to = opts["to"] as "review" | "approved" | "archived" | undefined;
    if (!id || !to || !["review", "approved", "archived"].includes(to)) {
      ctx.stderr("错误: 缺少必填选项 --id 或 --to (review/approved/archived)\n");
      return 1;
    }
    const engine = new SpecEngine({ root: ctx.cwd, store: new StateStore(p.events) });
    engine.advance(id, to);
    ctx.stdout(`已推进到 ${to}\n`);
    return 0;
  }

  ctx.stderr(`错误: 未知子命令 "${subCmd}"。运行 \`yunshou spec --help\` 查看用法\n`);
  return 1;
}

function showSpecHelp(ctx: CliContext): void {
  ctx.stdout("用法:\n");
  ctx.stdout("  yunshou spec create --id <id> --title <title> --date <date> --author <author>\n");
  ctx.stdout("                    --problem <text> --goal <text> --non-goals <text>\n");
  ctx.stdout("                    --decisions <text> --scenarios <text> --risks <text>\n");
  ctx.stdout("  yunshou spec advance --id <id> --to <phase>\n");
  ctx.stdout("\n");
  ctx.stdout("阶段: draft → review → approved → archived\n");
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

export const specCommand: CliCommand = {
  name: "spec",
  description: "规格管理 (create / advance)",
  handler,
};
