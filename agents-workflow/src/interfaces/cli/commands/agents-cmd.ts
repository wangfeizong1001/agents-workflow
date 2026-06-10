// 代理管理命令：列出和查看代理
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { CliCommand, CliContext } from "../types.js";

interface AgentMeta {
  readonly name: string;
  readonly type: string;
  readonly input: string;
  readonly output: string;
}

async function parseAgentMeta(filePath: string): Promise<AgentMeta | null> {
  try {
    const content = await readFile(filePath, "utf-8");
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match?.[1]) return null;
    const yaml = match[1];
    const get = (key: string): string => {
      const m = yaml.match(new RegExp(`${key}:\\s*(.+)`));
      return m?.[1]?.trim() ?? "";
    };
    return {
      name: get("name"),
      type: get("type"),
      input: get("input"),
      output: get("output"),
    };
  } catch {
    return null;
  }
}

export const agentsCmdCommand: CliCommand = {
  name: "agents",
  description: "管理代理：列出、查看",
  handler: async (ctx: CliContext): Promise<number> => {
    const sub = ctx.args[1];
    const agentsDir = join(ctx.cwd, "agents");

    if (!sub || sub === "list") {
      const files = await readdir(agentsDir).catch(() => []);
      const mdFiles = files.filter((f) => f.endsWith(".md"));
      if (mdFiles.length === 0) {
        ctx.stdout("未找到代理文件\n");
        return 0;
      }
      ctx.stdout(`可用代理 (${mdFiles.length} 个):\n\n`);
      const types = new Map<string, AgentMeta[]>();
      for (const file of mdFiles) {
        const meta = await parseAgentMeta(join(agentsDir, file));
        if (meta) {
          const t = meta.type || "未分类";
          const list = types.get(t) || [];
          list.push(meta);
          types.set(t, list);
        }
      }
      for (const [type, agents] of types) {
        ctx.stdout(`【${type}】\n`);
        for (const a of agents) {
          ctx.stdout(`  ${a.name.padEnd(25)} → ${a.output}\n`);
        }
        ctx.stdout("\n");
      }
      return 0;
    }

    if (sub === "show") {
      const name = ctx.args[2];
      if (!name) {
        ctx.stderr("用法: yunshou agents show <代理名>\n");
        return 1;
      }
      const filePath = join(agentsDir, `${name}.md`);
      try {
        const content = await readFile(filePath, "utf-8");
        ctx.stdout(content);
        return 0;
      } catch {
        ctx.stderr(`错误: 代理 "${name}" 不存在\n`);
        return 1;
      }
    }

    ctx.stderr(`错误: 未知子命令 "${sub}"。可用: list, show\n`);
    return 1;
  },
};
