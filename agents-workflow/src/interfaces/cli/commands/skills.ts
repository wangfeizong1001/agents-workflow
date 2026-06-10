// 技能管理命令：列出和查看技能
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { CliCommand, CliContext } from "../types.js";

interface SkillMeta {
  readonly name: string;
  readonly description: string;
  readonly category: string;
}

async function parseSkillMeta(skillDir: string): Promise<SkillMeta | null> {
  try {
    const content = await readFile(join(skillDir, "SKILL.md"), "utf-8");
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match?.[1]) return null;
    const yaml = match[1];
    const get = (key: string): string => {
      const m = yaml.match(new RegExp(`${key}:\\s*(.+)`));
      return m?.[1]?.trim() ?? "";
    };
    return {
      name: get("name"),
      description: get("description"),
      category: get("category"),
    };
  } catch {
    return null;
  }
}

export const skillsCommand: CliCommand = {
  name: "skills",
  description: "管理技能：列出、查看",
  handler: async (ctx: CliContext): Promise<number> => {
    const sub = ctx.args[1];
    const skillsDir = join(ctx.cwd, "skills");

    if (!sub || sub === "list") {
      const entries = await readdir(skillsDir, { withFileTypes: true }).catch(() => []);
      const dirs = entries.filter((e) => e.isDirectory());
      if (dirs.length === 0) {
        ctx.stdout("未找到技能目录\n");
        return 0;
      }
      ctx.stdout(`可用技能 (${dirs.length} 个):\n\n`);
      const categories = new Map<string, SkillMeta[]>();
      for (const dir of dirs) {
        const meta = await parseSkillMeta(join(skillsDir, dir.name));
        if (meta) {
          const cat = meta.category || "未分类";
          const list = categories.get(cat) || [];
          list.push(meta);
          categories.set(cat, list);
        }
      }
      for (const [cat, skills] of categories) {
        ctx.stdout(`【${cat}】\n`);
        for (const s of skills) {
          ctx.stdout(`  ${s.name.padEnd(25)} ${s.description}\n`);
        }
        ctx.stdout("\n");
      }
      return 0;
    }

    if (sub === "show") {
      const name = ctx.args[2];
      if (!name) {
        ctx.stderr("用法: yunshou skills show <技能名>\n");
        return 1;
      }
      const skillPath = join(skillsDir, name, "SKILL.md");
      try {
        const content = await readFile(skillPath, "utf-8");
        ctx.stdout(content);
        return 0;
      } catch {
        ctx.stderr(`错误: 技能 "${name}" 不存在\n`);
        return 1;
      }
    }

    ctx.stderr(`错误: 未知子命令 "${sub}"。可用: list, show\n`);
    return 1;
  },
};
