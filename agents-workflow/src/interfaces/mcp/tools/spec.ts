import { SpecEngine } from "../../../core/spec/engine.js";
import { StateStore } from "../../../core/state/store.js";

interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, string>, cwd: string) => Promise<string> | string;
}

export const specTools: readonly McpTool[] = [
  {
    name: "yunshou_spec_create",
    description: "创建云枢规格",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        date: { type: "string" },
        author: { type: "string" },
        problem: { type: "string" },
        goal: { type: "string" },
        nonGoals: { type: "string" },
        decisions: { type: "string" },
        scenarios: { type: "string" },
        risks: { type: "string" },
      },
      required: ["id", "title", "date", "author", "problem", "goal", "nonGoals", "decisions", "scenarios", "risks"],
    },
    handler: async (args: Record<string, string>, cwd: string): Promise<string> => {
      const engine = new SpecEngine({ root: cwd, store: new StateStore(`${cwd}/.yunshou/events.jsonl`) });
      engine.create({
        id: args["id"] ?? "",
        title: args["title"] ?? "",
        date: args["date"] ?? "",
        author: args["author"] ?? "",
        problem: args["problem"] ?? "",
        goal: args["goal"] ?? "",
        nonGoals: args["nonGoals"] ?? "",
        decisions: args["decisions"] ?? "",
        scenarios: args["scenarios"] ?? "",
        risks: args["risks"] ?? "",
      });
      return `已创建规格 ${args["id"]}`;
    },
  },
  {
    name: "yunshou_spec_advance",
    description: "推进规格阶段",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, to: { type: "string" } },
      required: ["id", "to"],
    },
    handler: async (args: Record<string, string>, cwd: string): Promise<string> => {
      const engine = new SpecEngine({ root: cwd, store: new StateStore(`${cwd}/.yunshou/events.jsonl`) });
      engine.advance(args["id"] ?? "", (args["to"] ?? "review") as "review" | "approved" | "archived");
      return `已推进到 ${args["to"]}`;
    },
  },
];
