import type { PlanTask } from "../plan/types.js";

export function renderPrompt(task: PlanTask, planId: string, specId: string): string {
  const bullets = task.bullets.length > 0
    ? task.bullets.map((b) => `- ${b}`).join("\n")
    : "- (无子项)";
  return `你正在执行云枢工作流中的任务。

[元数据]
- 计划 ID: ${planId}
- 规格 ID: ${specId}
- 任务 ID: ${task.id}
- 任务标题: ${task.title}
- 依赖: ${task.dependsOn.join(", ") || "(无)"}
- 涉及文件: ${task.fileHints.join(", ") || "(无)"}

[子任务]
${bullets}

[要求]
1. 严格按"子任务"列表的顺序逐项完成。
2. 每个文件修改前,先阅读其上下文,再修改。
3. 完成后,在终端运行 \`bun run typecheck && bun run lint && bun run test\`。
4. 若涉及新文件,在文件头用单行注释说明用途。
5. 完成后,回复一句话总结 + 上述命令的输出尾部 20 行。
`;
}
