// 云枢事件溯源类型定义 —— 任何写入 StateStore 的事件都必须满足 StateEvent 形状

export type StateEventType =
  | "spec.created"
  | "spec.phase.changed"
  | "spec.quality.passed"
  | "spec.quality.failed"
  | "plan.created"
  | "plan.phase.changed"
  | "plan.task.added"
  | "plan.task.started"
  | "plan.task.completed"
  | "plan.task.failed"
  | "execute.prompt.generated"
  | "execute.task.completed"
  | "verify.layer.passed"
  | "verify.layer.failed"
  | "guard.rejected"
  | "memory.l1.cached"
  | "memory.l3.snapshot"
  | "task.transition";

export interface StateEvent {
  readonly id: string;
  readonly ts: string;
  readonly session: string;
  readonly type: StateEventType;
  readonly specId?: string;
  readonly planId?: string;
  readonly taskId?: string;
  readonly phase?: string;
  readonly data?: Readonly<Record<string, unknown>>;
  // 允许事件携带额外字段(未来扩展),但必须可序列化
  readonly [extra: string]: unknown;
}

// 调用方在 append 时只需要提供 type + 业务字段,id/ts/session 由 store 注入
// 显式列出常用可选字段,避免索引签名导致 Omit 后类型推断失真
export type StateEventInput = {
  readonly type: StateEventType;
  readonly specId?: string;
  readonly planId?: string;
  readonly taskId?: string;
  readonly phase?: string;
  readonly data?: Readonly<Record<string, unknown>>;
  readonly [extra: string]: unknown;
};
