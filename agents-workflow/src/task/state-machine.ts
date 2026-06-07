// 云枢 Task 子系统 —— 任务状态机的合法转移表。
//
// 8 态状态机 (backlog / ready / in_progress / blocked / review / done / failed / cancelled)
// 的合法转移表,严格对齐 spec 6.2 节状态机图与 plan 任务 11 节点 11.2。
//
// 终态: done / cancelled (无任何出向转移,函数返回空数组)
// 失败态: failed (非终态,可重试回 ready 或主动取消)
//
// 状态机图的 ASCII 概览 (见 spec 6.2):
//   backlog ──refine──→ ready ──start──→ in_progress ──finish──→ review ──approve──→ done
//                                                                 ├─fix──→ in_progress
//                                                                 └─fail──→ failed ──retry──→ ready
//      in_progress / blocked / review 在异常路径上可向 failed / cancelled 转移。
//
// 本文件仅声明静态转移表与查询函数,不持有任何运行时状态;
// 任务 12 依赖分析与任务 13 TaskManager 状态守卫会复用本表。

import type { TaskStatus } from "./types.js";

const TRANSITIONS: Readonly<Record<TaskStatus, readonly TaskStatus[]>> = {
  backlog: ["ready", "cancelled"],
  ready: ["in_progress", "blocked", "cancelled"],
  in_progress: ["review", "blocked", "failed", "cancelled"],
  blocked: ["ready", "in_progress", "cancelled"],
  review: ["done", "in_progress", "failed"],
  done: [],
  failed: ["ready", "cancelled"],
  cancelled: [],
};

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function allowedNext(from: TaskStatus): readonly TaskStatus[] {
  return TRANSITIONS[from];
}
