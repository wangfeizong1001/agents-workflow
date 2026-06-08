import { readFileSync } from "node:fs";
import { PlanEngine } from "../../../core/plan/engine.js";
import { StateStore } from "../../../core/state/store.js";

interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, string>, cwd: string) => Promise<string> | string;
}

export const planTools: readonly McpTool[] = [
  {
    name: "yunshou_plan_create",
    description: "从 Markdown 创建计划",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, title: { type: "string" }, specId: { type: "string" }, fromFile: { type: "string" } },
      required: ["id", "title", "specId", "fromFile"],
    },
    handler: async (args: Record<string, string>, cwd: string): Promise<string> => {
      const engine = new PlanEngine({ root: cwd, store: new StateStore(`${cwd}/.yunshou/events.jsonl`) });
      const md = readFileSync(String(args["fromFile"]), "utf-8");
      const id = engine.create({
        id: String(args["id"]),
        title: String(args["title"]),
        specId: String(args["specId"]),
        markdown: md,
      });
      return `已创建计划 ${id}`;
    },
  },
  {
    name: "yunshou_plan_next",
    description: "获取下一个可执行任务",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    handler: async (args: Record<string, string>, cwd: string): Promise<string> => {
      const engine = new PlanEngine({ root: cwd, store: new StateStore(`${cwd}/.yunshou/events.jsonl`) });
      const t = engine.nextTask(String(args["id"]));
      if (!t) return "无可执行任务";
      return `下一个任务: ${t.id} — ${t.title}`;
    },
  },
];
