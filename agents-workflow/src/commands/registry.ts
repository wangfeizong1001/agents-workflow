import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { CommandDef, CommandRegistry, CommandParam, CommandCategory } from "./types.js";

/** 扫描 commands 目录，返回所有命令定义 */
export function scanCommands(commandsDir: string): CommandDef[] {
  const commands: CommandDef[] = [];
  let fileNames: string[];
  try {
    fileNames = readdirSync(commandsDir);
  } catch {
    return commands;
  }

  for (const name of fileNames) {
    if (!name.endsWith(".md")) continue;
    const filePath = join(commandsDir, name);
    const def = parseCommandFile(filePath);
    if (def) {
      commands.push(def);
    }
  }
  return commands;
}

/** 解析命令 markdown 文件 */
export function parseCommandFile(filePath: string): CommandDef | null {
  if (!existsSync(filePath)) return null;
  const content = readFileSync(filePath, "utf-8");
  return parseCommandContent(content, filePath);
}

/** 解析命令 markdown 内容 */
export function parseCommandContent(content: string, location: string): CommandDef {
  const frontmatter = extractFrontmatter(content);
  const params = extractParams(content);
  const usage = extractUsage(content);

  return {
    name: frontmatter["name"] ?? "unnamed-command",
    description: frontmatter["description"] ?? "",
    skill: frontmatter["skill"] ?? "",
    trigger: frontmatter["trigger"] ?? "",
    category: mapCategory(frontmatter["category"]),
    params,
    usage,
    location,
  };
}

/** 加载所有命令到注册表 */
export function loadAllCommands(commandsDir: string): CommandRegistry {
  const defs = scanCommands(commandsDir);
  const registry = new Map<string, CommandDef>();
  for (const def of defs) {
    registry.set(def.name, def);
  }
  return registry;
}

/** 按分类过滤命令 */
export function filterCommandsByCategory(
  registry: CommandRegistry,
  category: CommandCategory,
): CommandDef[] {
  const results: CommandDef[] = [];
  for (const cmd of registry.values()) {
    if (cmd.category === category) {
      results.push(cmd);
    }
  }
  return results;
}

function extractFrontmatter(content: string): Record<string, string | undefined> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const result: Record<string, string | undefined> = {};
  const lines = match[1]!.split("\n");
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    result[key] = value;
  }
  return result;
}

function extractParams(content: string): ReadonlyArray<CommandParam> {
  const params: CommandParam[] = [];
  const lines = content.split("\n");
  let inParams = false;

  for (const line of lines) {
    if (line.startsWith("### 参数")) {
      inParams = true;
      continue;
    }
    if (inParams && line.startsWith("### ")) {
      break;
    }
    if (inParams && line.startsWith("- `--")) {
      const match = line.match(/^- `(--\w+)`:\s*(.+)$/);
      if (match) {
        params.push({
          name: match[1]!,
          description: match[2]!.trim(),
          required: false,
        });
      }
    }
  }

  return params;
}

function extractUsage(content: string): string {
  const match = content.match(/### 用法\n(.+)/);
  return match?.[1]?.trim() ?? "";
}

const CATEGORY_MAP: Record<string, CommandCategory> = {
  "计划类": "plan",
  "评审类": "review",
  "项目类": "project",
  "调试类": "debug",
  "文档类": "docs",
  "工作流类": "workflow",
  "设置类": "settings",
  "探索类": "explore",
  "日常类": "daily",
  "变更类": "change",
  "工具类": "tools",
};

function mapCategory(raw: string | undefined): CommandCategory {
  if (!raw) return "other";
  return CATEGORY_MAP[raw] ?? "other";
}
