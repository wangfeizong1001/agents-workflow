import { specTools } from "./spec.js";
import { planTools } from "./plan.js";
import { executeTools } from "./execute.js";
import { verifyTools } from "./verify.js";
import { memoryTools } from "./memory.js";
import { taskTools } from "./task.js";
import { adapterStatus } from "../../../adapters/opencode/status.js";

interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, string>, cwd: string) => Promise<string> | string;
}

export const allTools: readonly McpTool[] = [
  ...specTools,
  ...planTools,
  ...executeTools,
  ...verifyTools,
  ...memoryTools,
  ...taskTools,
  {
    name: "yunshou_status",
    description: "查看云枢工作区状态",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args: Record<string, string>, cwd: string): Promise<string> => {
      return `工作区: ${cwd}\n适配器: ${adapterStatus(cwd).installed ? "已安装" : "未安装"}`;
    },
  },
];
