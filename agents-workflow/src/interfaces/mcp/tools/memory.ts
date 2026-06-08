// v0.1: Memory L1 存根 — 完整实现在后续阶段

interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, string>, cwd: string) => Promise<string> | string;
}

export const memoryTools: readonly McpTool[] = [
  {
    name: "yunshou_memory_l1_get",
    description: "获取 L1 内存 (v0.1 存根)",
    inputSchema: { type: "object", properties: { key: { type: "string" } }, required: ["key"] },
    handler: async (_args: Record<string, string>, _cwd: string): Promise<string> => {
      return "v0.1 存根: Memory L1 未实现";
    },
  },
];
