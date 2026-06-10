// 工作流管理命令：列出和执行工作流
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { CliCommand, CliContext } from "../types.js";

interface WorkflowMeta {
  readonly name: string;
  readonly description: string;
  readonly stages: readonly string[];
  readonly estimatedTime: string;
  readonly category: string;
}

async function parseWorkflowMeta(filePath: string): Promise<WorkflowMeta | null> {
  try {
    const content = await readFile(filePath, "utf-8");
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match?.[1]) return null;
    const yaml = match[1];
    const get = (key: string): string => {
      const m = yaml.match(new RegExp(`${key}:\\s*(.+)`));
      return m?.[1]?.trim() ?? "";
    };
    const getArr = (key: string): readonly string[] => {
      const m = yaml.match(new RegExp(`${key}:\\s*\\[(.+?)\\]`));
      return m?.[1] ? m[1].split(",").map((s) => s.trim()) : [];
    };
    return {
      name: get("name"),
      description: get("description"),
      stages: getArr("stages"),
      estimatedTime: get("estimated-time"),
      category: get("category"),
    };
  } catch {
    return null;
  }
}

export const workflowCommand: CliCommand = {
  name: "workflow",
  description: "管理工作流：列出、查看、执行",
  handler: async (ctx: CliContext): Promise<number> => {
    const sub = ctx.args[1];
    const workflowsDir = join(ctx.cwd, "workflow", "workflows");

    if (!sub || sub === "list") {
      // 列出所有工作流
      const files = await readdir(workflowsDir).catch(() => []);
      const mdFiles = files.filter((f) => f.endsWith(".md"));
      if (mdFiles.length === 0) {
        ctx.stdout("未找到工作流文件\n");
        return 0;
      }
      ctx.stdout(`可用工作流 (${mdFiles.length} 个):\n\n`);
      const categories = new Map<string, WorkflowMeta[]>();
      for (const file of mdFiles) {
        const meta = await parseWorkflowMeta(join(workflowsDir, file));
        if (meta) {
          const cat = meta.category || "未分类";
          const list = categories.get(cat) || [];
          list.push(meta);
          categories.set(cat, list);
        }
      }
      for (const [cat, workflows] of categories) {
        ctx.stdout(`【${cat}】\n`);
        for (const w of workflows) {
          ctx.stdout(`  ${w.name.padEnd(25)} ${w.description} (${w.estimatedTime})\n`);
        }
        ctx.stdout("\n");
      }
      return 0;
    }

    if (sub === "show") {
      const name = ctx.args[2];
      if (!name) {
        ctx.stderr("用法: yunshou workflow show <工作流名>\n");
        return 1;
      }
      const filePath = join(workflowsDir, `${name}.md`);
      try {
        const content = await readFile(filePath, "utf-8");
        ctx.stdout(content);
        return 0;
      } catch {
        ctx.stderr(`错误: 工作流 "${name}" 不存在\n`);
        return 1;
      }
    }

    if (sub === "run") {
      const name = ctx.args[2];
      if (!name) {
        ctx.stderr("用法: yunshou workflow run <工作流名>\n");
        return 1;
      }
      const filePath = join(workflowsDir, `${name}.md`);
      try {
        const content = await readFile(filePath, "utf-8");
        const meta = await parseWorkflowMeta(filePath);
        if (!meta) {
          ctx.stderr("错误: 无法解析工作流元数据\n");
          return 1;
        }
        ctx.stdout(`▶ 启动工作流: ${meta.name}\n`);
        ctx.stdout(`  描述: ${meta.description}\n`);
        ctx.stdout(`  预计耗时: ${meta.estimatedTime}\n`);
        ctx.stdout(`  阶段: ${meta.stages.join(" → ")}\n\n`);
        // TODO: 集成工作流引擎执行
        ctx.stdout("工作流引擎集成中，当前请参考工作流文档手动执行各阶段。\n");
        return 0;
      } catch {
        ctx.stderr(`错误: 工作流 "${name}" 不存在\n`);
        return 1;
      }
    }

    ctx.stderr(`错误: 未知子命令 "${sub}"。可用: list, show, run\n`);
    return 1;
  },
};
