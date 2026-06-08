import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";

export function uninstallClaudeCode(root: string): void {
  const base = join(root, ".claude");
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
