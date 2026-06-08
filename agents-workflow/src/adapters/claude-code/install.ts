import { join } from "node:path";
import { mkdirSync } from "node:fs";
import { writeFileAtomic } from "../../shared/fs-helpers.js";

const SKILL = `---
name: yunshou-workflow
description: 云枢 spec → plan → execute → verify 工作流。出现以下请求时使用: "云枢"、"yunshou"、"走工作流"、"按规格来"、"按计划来"、"先写规格再写计划"。
---

# 云枢工作流

## 何时调用

- 用户说"按云枢的流程做"
- 用户给出 spec/plan/execute 关键词
- 用户提示"先 brainstorm 再写代码"

## 四阶段

1. **spec**: 用 \`yunshou spec create ...\` 创建,正文需 ≥ 200 字 + 3 个场景。
2. **plan**: 用 \`yunshou plan create --from <file>\` 拆分,每任务 2-5 分钟。
3. **execute**: 用 \`yunshou execute next --plan-id <id>\` 生成提示词,贴进 IDE。
4. **verify**: 用 \`yunshou verify all\` 跑 5 层验证。

## 失败时

任一阶段失败,使用 /yunshou-reviewer 子代理复盘,严禁跳过验证。`;

const SPEC_CMD = `---
description: 走云枢规格流程
---
使用云枢 spec 工作流创建或推进规格。运行 \`yunshou spec create --help\` 查看参数。`;

const PLAN_CMD = `---
description: 走云枢计划流程
---
使用云枢 plan 工作流创建计划。运行 \`yunshou plan create --help\` 查看参数。`;

const EXEC_CMD = `---
description: 走云枢执行流程
---
使用云枢 execute 工作流执行下一个任务。运行 \`yunshou execute next --help\`。`;

const AGENT = `---
name: yunshou-reviewer
description: 云枢工作流复盘子代理。用于 verify 失败后的根因分析与下一步建议。
tools: read_file, grep, glob, bash
---

# 任务

当云枢 5 层验证中任意一层失败时,启动此子代理:

1. 读取 \`.yunshou/events.jsonl\` 最近 50 条事件。
2. 读取失败层的 stdout/stderr 尾部 100 行。
3. 给出:
   - 失败根因 (一句话)
   - 影响范围 (哪些任务可能被阻塞)
   - 修复建议 (1-3 个具体动作)
   - 预防措施 (1-2 条规则)
4. 严格不修改任何业务代码,只输出 Markdown 报告。`;

const MCP_CFG = {
  mcpServers: {
    yunshou: {
      command: "yunshou",
      args: ["mcp"],
      env: {},
    },
  },
};

export function installClaudeCode(root: string): void {
  const base = join(root, ".claude");
  mkdirSync(join(base, "skills", "yunshou-workflow"), { recursive: true });
  mkdirSync(join(base, "commands"), { recursive: true });
  mkdirSync(join(base, "agents"), { recursive: true });
  mkdirSync(join(base, "mcp"), { recursive: true });

  writeFileAtomic(join(base, "skills", "yunshou-workflow", "SKILL.md"), SKILL);
  writeFileAtomic(join(base, "commands", "spec.md"), SPEC_CMD);
  writeFileAtomic(join(base, "commands", "plan.md"), PLAN_CMD);
  writeFileAtomic(join(base, "commands", "execute.md"), EXEC_CMD);
  writeFileAtomic(join(base, "agents", "yunshou-reviewer.md"), AGENT);
  writeFileAtomic(join(base, "mcp", "yunshou-mcp.json"), `${JSON.stringify(MCP_CFG, null, 2)}\n`);
}
