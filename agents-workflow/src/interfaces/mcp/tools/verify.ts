import { VerifyEngine } from "../../../core/verify/engine.js";

interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, string>, cwd: string) => Promise<string> | string;
}

export const verifyTools: readonly McpTool[] = [
  {
    name: "yunshou_verify_all",
    description: "运行全部 5 层验证",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args: Record<string, string>, cwd: string): Promise<string> => {
      const engine = new VerifyEngine({ root: cwd });
      const report = await engine.runAll();
      const lines = report.layers.map((l) => `[${l.passed ? "PASS" : "FAIL"}] ${l.name} (${l.durationMs}ms)`);
      return lines.join("\n") + `\n\n总体: ${report.overall ? "通过" : "未通过"}`;
    },
  },
];
