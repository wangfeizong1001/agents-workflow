import { existsSync } from "node:fs";
import { join } from "node:path";

export function traeStatus(root: string): { installed: boolean; files: string[] } {
  const base = join(root, ".trae");
  const files = [
    join(base, "skills", "yunshou-workflow", "SKILL.md"),
    join(base, "mcp", "yunshou-mcp.json"),
  ];
  return {
    installed: files.every((f) => existsSync(f)),
    files: files.filter((f) => existsSync(f)),
  };
}
