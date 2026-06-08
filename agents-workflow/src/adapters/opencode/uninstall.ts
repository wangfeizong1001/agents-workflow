// 模块职责: 卸载 OpenCode 适配器 —— 清理 .opencode/ 下所有生成文件。
//
// 接口契约:
//   - uninstallOpencode(root) 删除 6 个文件/目录;不存在的文件静默跳过

import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";

export function uninstallOpencode(root: string): void {
  const base = join(root, ".opencode");
  const targets = [
    join(base, "skills", "yunshou-workflow"),
    join(base, "commands", "spec.md"),
    join(base, "commands", "plan.md"),
    join(base, "commands", "execute.md"),
    join(base, "agents", "yunshou-reviewer.md"),
    join(base, "mcp", "yunshou-mcp.json"),
  ];
  for (const p of targets) {
    if (existsSync(p)) rmSync(p, { recursive: true, force: true });
  }
}
