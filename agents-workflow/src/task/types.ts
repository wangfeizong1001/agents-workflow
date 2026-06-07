export type TaskStatus =
  | "backlog"
  | "ready"
  | "in_progress"
  | "blocked"
  | "review"
  | "done"
  | "failed"
  | "cancelled";

export type TaskPriority = "P0" | "P1" | "P2" | "P3";

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
  readonly [extra: string]: unknown;
}

export interface TaskTransition {
  readonly taskId: string;
  readonly from: TaskStatus;
  readonly to: TaskStatus;
  readonly ts: string;
  readonly reason?: string;
}
