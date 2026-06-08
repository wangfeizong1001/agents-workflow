// 云枢 Plan 子系统 —— Markdown 任务拆分器 (阶段 7 任务 21)。
//
// 模块职责:
//   - splitPlan(markdown, planId): 解析 `## 任务 N: 标题` 格式的 Markdown,
//     拆出 PlanTask 列表, 自动编号为 {planId}.T1 / T2 / ...
//   - extractFileHints: 从 bullet 文本中提取 `path/file.ext` 格式的路径提示。
//
// 接口契约:
//   - 无 `## 任务` 标题时抛 PLAN_DAG_CYCLE (复用此错误码表示"无任务")。
//   - T1 无依赖, T2+ 默认 dependsOn = [T(n-1)]。
//   - extractFileHints 去重, 返回顺序按首次出现。

import { YunShouError, YSErrorCode } from "../../shared/errors.js";
import type { PlanTask } from "./types.js";

export function splitPlan(markdown: string, planId: string): PlanTask[] {
  const lines = markdown.split("\n");
  const tasks: PlanTask[] = [];
  let current: { title: string; bullets: string[] } | null = null;
  for (const line of lines) {
    const m = /^##\s+任务\s+(\d+)\s*[:：]\s*(.+)$/.exec(line);
    if (m) {
      if (current) {
        tasks.push(toTask(current, planId, tasks.length + 1));
      }
      current = { title: m[2] ?? "", bullets: [] };
      continue;
    }
    if (current) {
      const bullet = /^\s*-\s+(.+)$/.exec(line);
      if (bullet) current.bullets.push((bullet[1] ?? "").trim());
    }
  }
  if (current) {
    tasks.push(toTask(current, planId, tasks.length + 1));
  }
  if (tasks.length === 0) {
    throw new YunShouError("计划不含任何任务", YSErrorCode.PLAN_DAG_CYCLE, { planId });
  }
  return tasks;
}

function toTask(
  raw: { title: string; bullets: string[] },
  planId: string,
  n: number,
): PlanTask {
  return {
    id: `${planId}.T${n}`,
    planId,
    title: raw.title.trim(),
    bullets: raw.bullets,
    status: "pending",
    dependsOn: n === 1 ? [] : [`${planId}.T${n - 1}`],
    fileHints: extractFileHints(raw.bullets),
  };
}

function extractFileHints(bullets: readonly string[]): readonly string[] {
  const re = /`([\w./-]+\.[a-z]{1,5})`/gi;
  const out = new Set<string>();
  for (const b of bullets) {
    const matches = b.matchAll(re);
    for (const m of matches) {
      const path = m[1];
      if (path) out.add(path);
    }
  }
  return [...out];
}
