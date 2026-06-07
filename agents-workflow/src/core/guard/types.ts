// 云枢 Guard 子系统 —— 4 套状态机类型定义。
//
// 本文件集中声明 4 套子状态机的字面量枚举与状态字段,供 spec-guard (任务 16)
// 及其后续 plan-guard / execute-guard / task-flow-guard 复用:
//
//   - SpecPhase    (draft / review / approved / archived)    — 规格 4 态
//   - PlanPhase    (draft / approved / in_progress / completed) — 计划 4 态 (任务 17+ 占位)
//   - ExecutePhase (idle / running / paused / completed)     — 执行 4 态 (任务 17+ 占位)
//   - TaskFlowPhase (blocked / unblocked)                    — 任务级 2 态 (任务 17+ 占位)
//
// 所有字段均为 readonly,符合 AGENTS.md "不可变数据" 约定;调用方需要在
// 状态变更时构造新对象而非就地改写。
//
// 字段语义备注:
//   - SpecState.hasQuestions: 当前 spec-guard 不消费,留作未来 "draft→review
//     时若 hasQuestions=true 应强制决策澄清" 升级路径的信号位
//   - SpecState.scenarioCount: 给定场景数,质量门禁要求 ≥ 3
//   - PlanState.dagValid: 由任务 12 dependency 模块计算的 DAG 合法性
//
// plan 已知局限:
//   - 4 套状态机的 Plan/Execute/TaskFlow 类型在本任务 (16) 中为占位,无对应
//     护栏实现,留到任务 17+ 阶段 5 接入时补 guard 实现
//   - SpecState 字段集与 spec 章节对齐,后续如扩展字段需走 spec 修订流程

export type SpecPhase = "draft" | "review" | "approved" | "archived";

export interface SpecState {
  readonly id: string;
  readonly title: string;
  readonly phase: SpecPhase;
  readonly body: string;
  readonly hasQuestions: boolean;
  readonly hasDecisions: boolean;
  readonly scenarioCount: number;
}

export type PlanPhase = "draft" | "approved" | "in_progress" | "completed";
export interface PlanState {
  readonly id: string;
  readonly title: string;
  readonly phase: PlanPhase;
  readonly taskCount: number;
  readonly dagValid: boolean;
}

export type ExecutePhase = "idle" | "running" | "paused" | "completed";
export interface ExecuteState {
  readonly planId: string;
  readonly phase: ExecutePhase;
  readonly currentTaskId: string | null;
  readonly completedTaskCount: number;
}

export type TaskFlowPhase = "blocked" | "unblocked";
export interface TaskFlowState {
  readonly taskId: string;
  readonly planId: string;
  readonly phase: TaskFlowPhase;
  readonly parentDone: boolean;
}
