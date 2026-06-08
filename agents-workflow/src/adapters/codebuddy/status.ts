import { existsSync } from "node:fs";
import { join } from "node:path";

export function codebuddyStatus(root: string): { installed: boolean; files: string[] } {
  const base = join(root, ".codebuddy");
  const files = [
    join(base, "skills", "yunshou-workflow", "SKILL.md"),
    join(base, "mcp", "yunshou-mcp.json"),
  ];
  return {
    installed: files.every((f) => existsSync(f)),
    files: files.filter((f) => existsSync(f)),
  };
}
