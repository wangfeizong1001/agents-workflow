import { readFileSync, existsSync } from "node:fs";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { WorkflowDef, WorkflowStep, WorkflowRegistry } from "./types.js";

/** 解析工作流 markdown 文件 */
export function parseWorkflow(filePath: string): WorkflowDef | null {
  if (!existsSync(filePath)) return null;
  const raw = readFileSync(filePath, "utf-8");
  return parseWorkflowContent(raw, filePath);
}

/** 解析工作流 markdown 内容 */
export function parseWorkflowContent(content: string, location: string): WorkflowDef {
  const frontmatter = extractFrontmatter(content);
  const steps = extractSteps(content);

  return {
    name: frontmatter["name"] ?? "未命名工作流",
    description: frontmatter["description"] ?? "",
    steps,
    category: frontmatter["category"] ?? "other",
    estimatedTime: frontmatter["estimated-time"] ?? "未知",
    location,
  };
}

/** 扫描工作流目录，返回所有工作流定义 */
export function scanWorkflows(workflowsDir: string): WorkflowDef[] {
  const workflows: WorkflowDef[] = [];
  let fileNames: string[];
  try {
    fileNames = readdirSync(workflowsDir);
  } catch {
    return workflows;
  }

  for (const name of fileNames) {
    if (!name.endsWith(".md")) continue;
    const filePath = join(workflowsDir, name);
    const def = parseWorkflow(filePath);
    if (def) {
      workflows.push(def);
    }
  }
  return workflows;
}

/** 加载所有工作流到注册表 */
export function loadAllWorkflows(workflowsDir: string): WorkflowRegistry {
  const defs = scanWorkflows(workflowsDir);
  const registry = new Map<string, WorkflowDef>();
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

function extractSteps(content: string): WorkflowStep[] {
  const steps: WorkflowStep[] = [];
  const lines = content.split("\n");
  let stepIdx = 0;

  for (const line of lines) {
    const stepMatch = line.match(/^- [①②③④⑤⑥⑦⑧⑨⑩]\s+(.+?)(?:\s*→\s*(.+))?$/);
    if (stepMatch) {
      stepIdx++;
      const command = stepMatch[1]!.trim();
      const description = stepMatch[2]?.trim() ?? "";
      steps.push({
        id: `step-${stepIdx}`,
        name: description || command,
        command,
        args: [],
      });
    }
  }

  return steps;
}
