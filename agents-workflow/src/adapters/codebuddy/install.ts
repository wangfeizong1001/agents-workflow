import { join } from "node:path";
import { mkdirSync } from "node:fs";
import { writeFileAtomic } from "../../shared/fs-helpers.js";

const SKILL = `---
name: yunshou-workflow
description: 云枢 spec → plan → execute → verify 工作流。
---

# 云枢工作流

1. **spec**: 用 \`yunshou spec create ...\` 创建
2. **plan**: 用 \`yunshou plan create --from <file>\` 拆分
3. **execute**: 用 \`yunshou execute next --plan-id <id>\` 执行
4. **verify**: 用 \`yunshou verify all\` 验证`;

const MCP_CFG = {
  mcpServers: {
    yunshou: {
      command: "yunshou",
      args: ["mcp"],
      env: {},
    },
  },
};

export function installCodebuddy(root: string): void {
  const base = join(root, ".codebuddy");
  mkdirSync(join(base, "skills", "yunshou-workflow"), { recursive: true });
  mkdirSync(join(base, "mcp"), { recursive: true });
  writeFileAtomic(join(base, "skills", "yunshou-workflow", "SKILL.md"), SKILL);
  writeFileAtomic(join(base, "mcp", "yunshou-mcp.json"), `${JSON.stringify(MCP_CFG, null, 2)}\n`);
}
