// 模块职责: 查询 OpenCode 适配器安装状态。
//
// 接口契约:
//   - adapterStatus(root) 返回 { installed, files }

import { existsSync } from "node:fs";
import { join } from "node:path";

export function adapterStatus(root: string): { installed: boolean; files: string[] } {
  const base = join(root, ".opencode");
  const files = [
    join(base, "skills", "yunshou-workflow", "SKILL.md"),
    join(base, "commands", "spec.md"),
    join(base, "commands", "plan.md"),
    join(base, "commands", "execute.md"),
    join(base, "agents", "yunshou-reviewer.md"),
    join(base, "mcp", "yunshou-mcp.json"),
  ];
  return {
    installed: files.every((f) => existsSync(f)),
    files: files.filter((f) => existsSync(f)),
  };
}
