// 云枢 Task 子系统 —— 任务依赖图分析。
//
// 提供三个工具函数:
//   topologicalSort  Kahn BFS 拓扑排序,环存在时抛 PLAN_DAG_CYCLE
//   detectCycle      三色 DFS 返回首个环路径,无环返空数组
//   readyTasks       过滤 status=ready 且所有依赖已 done 的任务
//
// 选型: Kahn 排序副产品即可判环(出队数 < 顶点数即有环),O(V+E);
//       三色 DFS 比两色多一状态(灰=在栈),可返回具体环路径供错误信息使用。
//
// 复用关系: topologicalSort 内部异常路径会二次调用 detectCycle 以拿到
// 具体环路径,Kahn 仅能判"有环",无法给出路径;环是异常路径,常态为 O(V+E) 一次。

import { YunShouError, YSErrorCode } from "../shared/errors.js";
import type { Task } from "./types.js";

export function topologicalSort(tasks: readonly Task[]): Task[] {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const indeg = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const t of tasks) {
    indeg.set(t.id, t.dependsOn.filter((d) => byId.has(d)).length);
    for (const d of t.dependsOn) {
      if (!byId.has(d)) continue;
      const list = adj.get(d) ?? [];
      list.push(t.id);
      adj.set(d, list);
    }
  }
  const queue: string[] = [];
  for (const [id, n] of indeg) if (n === 0) queue.push(id);
  const out: Task[] = [];
  while (queue.length > 0) {
    const id = queue.shift();
    if (id === undefined) break;
    const t = byId.get(id);
    if (t) out.push(t);
    for (const n of adj.get(id) ?? []) {
      const left = (indeg.get(n) ?? 0) - 1;
      indeg.set(n, left);
      if (left === 0) queue.push(n);
    }
  }
  if (out.length !== tasks.length) {
    const cycle = detectCycle(tasks);
    throw new YunShouError(
      "任务依赖图存在环",
      YSErrorCode.PLAN_DAG_CYCLE,
      { cycle },
    );
  }
  return out;
}

export function detectCycle(tasks: readonly Task[]): string[] {
  const adj = new Map<string, string[]>();
  for (const t of tasks) {
    adj.set(t.id, t.dependsOn.filter((d) => tasks.some((x) => x.id === d)));
  }
  const color = new Map<string, "w" | "g" | "b">();
  const path: string[] = [];
  for (const t of tasks) {
    if ((color.get(t.id) ?? "w") === "w") {
      const r = dfs(t.id, adj, color, path);
      if (r) return r;
    }
  }
  return [];
}

function dfs(
  start: string,
  adj: Map<string, string[]>,
  color: Map<string, "w" | "g" | "b">,
  path: string[],
): string[] | null {
  color.set(start, "g");
  path.push(start);
  for (const n of adj.get(start) ?? []) {
    if ((color.get(n) ?? "w") === "g") {
      const idx = path.indexOf(n);
      return [...path.slice(idx), n];
    }
    if ((color.get(n) ?? "w") === "w") {
      const r = dfs(n, adj, color, path);
      if (r) return r;
    }
  }
  color.set(start, "b");
  path.pop();
  return null;
}

export function readyTasks(tasks: readonly Task[]): Task[] {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  return tasks.filter(
    (t) =>
      t.status === "ready" &&
      t.dependsOn.every((d) => byId.get(d)?.status === "done"),
  );
}
