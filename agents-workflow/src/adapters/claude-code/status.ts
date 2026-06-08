import { existsSync } from "node:fs";
import { join } from "node:path";

export function claudeCodeStatus(root: string): { installed: boolean; files: string[] } {
  const base = join(root, ".claude");
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
