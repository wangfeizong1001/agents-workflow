// 云枢 Task 子系统 —— 文本仪表盘渲染。
//
// 按 8 个状态桶分桶输出任务列表,空桶跳过;面向 CLI/CI 人工查看。

import type { Task, TaskStatus } from "./types.js";

const BUCKETS: readonly TaskStatus[] = [
  "backlog",
  "ready",
  "in_progress",
  "blocked",
  "review",
  "done",
  "failed",
  "cancelled",
];

export function renderDashboard(tasks: readonly Task[]): string {
  const lines: string[] = ["# 任务仪表盘", ""];
  for (const bucket of BUCKETS) {
    const inBucket = tasks.filter((t) => t.status === bucket);
    if (inBucket.length === 0) continue;
    lines.push(`## ${bucket.toUpperCase()} (${inBucket.length})`);
    for (const t of inBucket) {
      lines.push(`- [${t.priority}] ${t.id} — ${t.title}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
