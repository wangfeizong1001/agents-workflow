// 云枢 Plan 子系统 —— PlanTask / Plan 类型定义 (阶段 7 任务 21)。
//
// 接口契约:
//   - PlanTaskStatus: 4 态执行状态, 由 PlanEngine.markTask 流转。
//   - PlanTask.dependsOn: T1 依赖为空, T2+ 默认依赖前一任务。
//   - PlanTask.fileHints: 由 splitter.extractFileHints 从 bullets 的 `path` 中提取。

export type PlanTaskStatus = "pending" | "in_progress" | "done" | "failed";

export interface PlanTask {
  readonly id: string;
  readonly planId: string;
  readonly title: string;
  readonly bullets: readonly string[];
  readonly status: PlanTaskStatus;
  readonly dependsOn: readonly string[];
  readonly fileHints: readonly string[];
}

export interface Plan {
  readonly id: string;
  readonly title: string;
  readonly specId: string;
  readonly tasks: readonly PlanTask[];
}
