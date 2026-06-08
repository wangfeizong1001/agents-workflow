// 云枢 Task 子系统 —— 任务数据形状与状态 / 优先级枚举。
//
// 8 态状态机: backlog / ready / in_progress / blocked / review / done / failed / cancelled
// 4 级优先级: P0 (critical) / P1 (high) / P2 (medium) / P3 (low)
//
// 合法转移表 (TaskStatus × TaskStatus) 见 state-machine.ts (阶段 2 任务 11),
// 本文件仅定义数据形状,不包含任何运行时状态机逻辑。
//
// 字段集严格对齐 plan 7.1 节;v0.1 不实现 spec 6.2 节原始草稿的扩展字段
// (blocks / parentId / checklist / artifacts / comments / activity 等),
// 改由 [extra: string]: unknown 索引签名承载,见 spec 6.2 节"v0.1 实现说明"。

export const TaskStatus = {
  backlog: "backlog",
  ready: "ready",
  in_progress: "in_progress",
  blocked: "blocked",
  review: "review",
  done: "done",
  failed: "failed",
  cancelled: "cancelled",
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TASK_STATUSES: readonly TaskStatus[] = Object.values(TaskStatus);

export const TaskPriority = {
  P0: "P0",
  P1: "P1",
  P2: "P2",
  P3: "P3",
} as const;
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];

export const TASK_PRIORITIES: readonly TaskPriority[] = Object.values(TaskPriority);

export interface Task {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly dependsOn: readonly string[];
  readonly owner?: string;
  readonly createdAt: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly tags?: readonly string[];
  readonly assignee?: string;
  readonly blocks?: readonly string[];
  readonly parentId?: string;
  readonly subtaskIds?: readonly string[];
  readonly estimateMin?: number;
  readonly actualMin?: number;
  readonly due?: string;
  readonly [extra: string]: unknown;
}

export interface TaskTransition {
  readonly taskId: string;
  readonly from: TaskStatus;
  readonly to: TaskStatus;
  readonly ts: string;
  readonly reason?: string;
  readonly actor?: string;
}
