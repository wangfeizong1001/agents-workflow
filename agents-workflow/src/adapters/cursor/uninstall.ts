import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";

export function uninstallCursor(root: string): void {
  const base = join(root, ".cursor");
  const targets = [
    join(base, "skills", "yunshou-workflow"),
    join(base, "mcp", "yunshou-mcp.json"),
  ];
  for (const p of targets) {
    if (existsSync(p)) rmSync(p, { recursive: true, force: true });
  }
}
