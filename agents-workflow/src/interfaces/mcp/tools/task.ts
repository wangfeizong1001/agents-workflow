// v0.1: Task 存根 — 完整实现在后续阶段

interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, string>, cwd: string) => Promise<string> | string;
}

export const taskTools: readonly McpTool[] = [
  {
    name: "yunshou_task_create",
    description: "创建任务 (v0.1 存根)",
    inputSchema: { type: "object", properties: { title: { type: "string" }, description: { type: "string" } }, required: ["title"] },
    handler: async (_args: Record<string, string>, _cwd: string): Promise<string> => {
      return "v0.1 存根: Task 子系统未实现";
    },
  },
  {
    name: "yunshou_task_list",
    description: "列出任务 (v0.1 存根)",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args: Record<string, string>, _cwd: string): Promise<string> => {
      return "v0.1 存根: Task 子系统未实现";
    },
  },
];
