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
