import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scanSkills, loadSkill, loadAllSkills, filterByCategory, searchSkills } from "../../src/skills/index.js";

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ys-skills-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function createSkill(name: string, desc: string): void {
  const skillDir = join(dir, name);
  mkdirSync(skillDir, { recursive: true });
  writeFileSync(
    join(skillDir, "SKILL.md"),
    `# ${name}\n\ndescription: ${desc}\n\n## Instructions\n\nDo something useful.\n`,
    "utf-8",
  );
}

describe("Skills 引擎", () => {
  it("scanSkills 应扫描目录下所有技能", () => {
    createSkill("qa", "质量保障技能");
    createSkill("ship", "交付技能");
    createSkill("debug", "调试技能");

    const skills = scanSkills(dir);
    expect(skills).toHaveLength(3);
    expect(skills.map((s) => s.name).sort()).toEqual(["debug", "qa", "ship"]);
  });

  it("scanSkills 在目录不存在时返回空数组", () => {
    const skills = scanSkills("/nonexistent/path");
    expect(skills).toEqual([]);
  });

  it("parseSkillMeta 应正确解析描述", () => {
    createSkill("my-skill", "这是一个测试技能");
    const skills = scanSkills(dir);
    expect(skills[0]?.description).toBe("这是一个测试技能");
  });

  it("inferCategory 应正确分类", () => {
    createSkill("qa", "质量");
    createSkill("ship", "交付");
    createSkill("design-review", "设计");
    createSkill("security-audit", "安全");
    createSkill("docs-update", "文档");
    createSkill("browse", "工具");
    createSkill("something-else", "其他");

    const skills = scanSkills(dir);
    const categories = Object.fromEntries(skills.map((s) => [s.name, s.category]));
    expect(categories["qa"]).toBe("quality");
    expect(categories["ship"]).toBe("delivery");
    expect(categories["design-review"]).toBe("design");
    expect(categories["security-audit"]).toBe("security");
    expect(categories["docs-update"]).toBe("docs");
    expect(categories["browse"]).toBe("tools");
    expect(categories["something-else"]).toBe("other");
  });

  it("loadSkill 应加载完整内容", () => {
    createSkill("test-skill", "测试描述");
    const skills = scanSkills(dir);
    const content = loadSkill(skills[0]!);

    expect(content.markdown).toContain("# test-skill");
    expect(content.instructions).toContain("## Instructions");
    expect(content.meta.name).toBe("test-skill");
  });

  it("loadAllSkills 应返回完整注册表", () => {
    createSkill("skill-a", "A");
    createSkill("skill-b", "B");

    const registry = loadAllSkills(dir);
    expect(registry.size).toBe(2);
    expect(registry.has("skill-a")).toBe(true);
    expect(registry.has("skill-b")).toBe(true);
  });

  it("filterByCategory 应按分类过滤", () => {
    createSkill("qa", "质量");
    createSkill("ship", "交付");
    createSkill("debug", "调试");

    const registry = loadAllSkills(dir);
    const quality = filterByCategory(registry, "quality");
    expect(quality).toHaveLength(2);
    expect(quality.map((s) => s.meta.name).sort()).toEqual(["debug", "qa"]);
  });

  it("searchSkills 应按名称搜索", () => {
    createSkill("code-review", "代码评审");
    createSkill("design-review", "设计评审");
    createSkill("ship", "交付");

    const registry = loadAllSkills(dir);
    const results = searchSkills(registry, "review");
    expect(results).toHaveLength(2);
  });

  it("searchSkills 应按描述搜索", () => {
    createSkill("skill-a", "这是一个质量保障工具");
    createSkill("skill-b", "这是一个交付工具");

    const registry = loadAllSkills(dir);
    const results = searchSkills(registry, "质量");
    expect(results).toHaveLength(1);
    expect(results[0]?.meta.name).toBe("skill-a");
  });
});
