import { ExecuteEngine } from "../../../core/execute/engine.js";
import { StateStore } from "../../../core/state/store.js";

interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, string>, cwd: string) => Promise<string> | string;
}

export const executeTools: readonly McpTool[] = [
  {
    name: "yunshou_execute_next",
    description: "生成下一个任务提示词",
    inputSchema: { type: "object", properties: { planId: { type: "string" } }, required: ["planId"] },
    handler: async (args: Record<string, string>, cwd: string): Promise<string> => {
      const engine = new ExecuteEngine({ root: cwd, store: new StateStore(`${cwd}/.yunshou/events.jsonl`) });
      const out = engine.nextPrompt(String(args["planId"]));
      if (!out) return "无可执行任务";
      return `任务 ${out.taskId} 的提示词已写入: ${out.promptFile}`;
    },
  },
  {
    name: "yunshou_execute_complete",
    description: "标记任务完成",
    inputSchema: { type: "object", properties: { planId: { type: "string" }, taskId: { type: "string" } }, required: ["planId", "taskId"] },
    handler: async (args: Record<string, string>, cwd: string): Promise<string> => {
      const engine = new ExecuteEngine({ root: cwd, store: new StateStore(`${cwd}/.yunshou/events.jsonl`) });
      engine.completeTask(String(args["planId"]), String(args["taskId"]));
      return `已标记 ${args["taskId"]} 完成`;
    },
  },
];
