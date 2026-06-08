import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";

export function uninstallCodebuddy(root: string): void {
  const base = join(root, ".codebuddy");
  const targets = [
    join(base, "skills", "yunshou-workflow"),
    join(base, "mcp", "yunshou-mcp.json"),
  ];
  for (const p of targets) {
    if (existsSync(p)) rmSync(p, { recursive: true, force: true });
  }
}
