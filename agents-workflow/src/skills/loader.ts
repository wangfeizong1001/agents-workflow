import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { SkillMeta, SkillContent, SkillRegistry, SkillCategory } from "./types.js";

/** 扫描 skills 目录，返回所有技能元数据 */
export function scanSkills(skillsDir: string): SkillMeta[] {
  const skills: SkillMeta[] = [];
  let dirNames: string[];
  try {
    dirNames = readdirSync(skillsDir);
  } catch {
    return skills;
  }

  for (const name of dirNames) {
    const skillPath = join(skillsDir, name, "SKILL.md");
    if (!existsSync(skillPath)) continue;
    const content = readFileSync(skillPath, "utf-8");
    const meta = parseSkillMeta(name, skillPath, content);
    skills.push(meta);
  }
  return skills;
}

/** 加载单个技能的完整内容 */
export function loadSkill(meta: SkillMeta): SkillContent {
  const markdown = readFileSync(meta.location, "utf-8");
  return {
    meta,
    markdown,
    instructions: extractInstructions(markdown),
  };
}

/** 加载所有技能到注册表 */
export function loadAllSkills(skillsDir: string): SkillRegistry {
  const metas = scanSkills(skillsDir);
  const registry = new Map<string, SkillContent>();
  for (const meta of metas) {
    registry.set(meta.name, loadSkill(meta));
  }
  return registry;
}

/** 按分类过滤技能 */
export function filterByCategory(
  registry: SkillRegistry,
  category: SkillCategory,
): SkillContent[] {
  const results: SkillContent[] = [];
  for (const skill of registry.values()) {
    if (skill.meta.category === category) {
      results.push(skill);
    }
  }
  return results;
}

/** 搜索技能 */
export function searchSkills(
  registry: SkillRegistry,
  query: string,
): SkillContent[] {
  const lower = query.toLowerCase();
  const results: SkillContent[] = [];
  for (const skill of registry.values()) {
    if (
      skill.meta.name.toLowerCase().includes(lower) ||
      skill.meta.description.toLowerCase().includes(lower)
    ) {
      results.push(skill);
    }
  }
  return results;
}

function parseSkillMeta(name: string, location: string, content: string): SkillMeta {
  const descMatch = content.match(/^description:\s*(.+)$/m);
  return {
    name,
    description: descMatch?.[1]?.trim() ?? "",
    category: inferCategory(name),
    location,
  };
}

function inferCategory(name: string): SkillCategory {
  if (["design", "ui", "html", "shotgun"].some((k) => name.includes(k))) return "design";
  if (["security", "cso", "guard", "careful"].some((k) => name.includes(k))) return "security";
  if (["ship", "deploy", "land", "canary"].some((k) => name.includes(k))) return "delivery";
  if (["spec", "prd", "plan", "propose", "change"].some((k) => name.includes(k)))
    return "planning";
  if (["document", "docs", "write"].some((k) => name.includes(k))) return "docs";
  if (["browse", "scrape", "mcp", "make-pdf"].some((k) => name.includes(k))) return "tools";
  if (["qa", "review", "debug", "investigate", "retro"].some((k) => name.includes(k)))
    return "quality";
  return "other";
}

function extractInstructions(markdown: string): string {
  const lines = markdown.split("\n");
  const instructionLines: string[] = [];
  let inInstructions = false;
  for (const line of lines) {
    if (line.startsWith("## ") || line.startsWith("# ")) {
      inInstructions = true;
    }
    if (inInstructions) {
      instructionLines.push(line);
    }
  }
  return instructionLines.join("\n") || markdown;
}
