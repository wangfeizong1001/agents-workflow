import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { AgentDef, AgentRegistry, AgentType } from "./types.js";

/** 扫描 agents 目录，返回所有 Agent 定义 */
export function scanAgents(agentsDir: string): AgentDef[] {
  const agents: AgentDef[] = [];
  let fileNames: string[];
  try {
    fileNames = readdirSync(agentsDir);
  } catch {
    return agents;
  }

  for (const name of fileNames) {
    if (!name.endsWith(".md")) continue;
    const filePath = join(agentsDir, name);
    const def = parseAgentFile(filePath);
    if (def) {
      agents.push(def);
    }
  }
  return agents;
}

/** 解析 Agent markdown 文件 */
export function parseAgentFile(filePath: string): AgentDef | null {
  if (!existsSync(filePath)) return null;
  const content = readFileSync(filePath, "utf-8");
  return parseAgentContent(content, filePath);
}

/** 解析 Agent markdown 内容 */
export function parseAgentContent(content: string, location: string): AgentDef {
  const frontmatter = extractFrontmatter(content);
  const name = frontmatter["name"] ?? "unnamed-agent";
  const instructions = extractInstructions(content);

  return {
    name,
    type: inferAgentType(frontmatter["type"]),
    description: frontmatter["description"] ?? "",
    input: frontmatter["input"] ?? "",
    output: frontmatter["output"] ?? "",
    tools: parseTools(frontmatter["tools"]),
    instructions,
    location,
  };
}

/** 加载所有 Agent 到注册表 */
export function loadAllAgents(agentsDir: string): AgentRegistry {
  const defs = scanAgents(agentsDir);
  const registry = new Map<string, AgentDef>();
  for (const def of defs) {
    registry.set(def.name, def);
  }
  return registry;
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

function extractInstructions(content: string): string {
  const lines = content.split("\n");
  const instructionLines: string[] = [];
  let inInstructions = false;
  for (const line of lines) {
    if (line.startsWith("## ")) {
      inInstructions = true;
    }
    if (inInstructions) {
      instructionLines.push(line);
    }
  }
  return instructionLines.join("\n") || content;
}

function parseTools(toolsStr: string | undefined): ReadonlyArray<string> {
  if (!toolsStr) return [];
  const match = toolsStr.match(/\[(.+)\]/);
  if (!match) return [];
  return match[1]!.split(",").map((t) => t.trim());
}

function inferAgentType(typeStr: string | undefined): AgentType {
  switch (typeStr) {
    case "independent":
      return "independent";
    case "analysis":
      return "analysis";
    case "review":
      return "review";
    case "planning":
      return "planning";
    case "doc":
      return "doc";
    case "debug":
      return "debug";
    case "ui":
      return "ui";
    case "integration":
      return "integration";
    default:
      return "other";
  }
}
