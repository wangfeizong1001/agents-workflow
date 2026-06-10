/**
 * Workflow 引擎类型定义
 * 将 workflow/workflows/*.md 转化为可执行工作流
 */

/** 工作流步骤 */
export interface WorkflowStep {
  readonly id: string;
  readonly name: string;
  readonly command: string;
  readonly args: ReadonlyArray<string>;
  readonly dependsOn?: ReadonlyArray<string>;
  readonly condition?: string;
}

/** 工作流定义（从 markdown 解析） */
export interface WorkflowDef {
  readonly name: string;
  readonly description: string;
  readonly steps: ReadonlyArray<WorkflowStep>;
  readonly category: string;
  readonly estimatedTime: string;
  readonly location: string;
}

/** 步骤执行结果 */
export interface StepResult {
  readonly stepId: string;
  readonly success: boolean;
  readonly output: string;
  readonly duration: number;
}

/** 工作流执行结果 */
export interface WorkflowResult {
  readonly workflow: string;
  readonly success: boolean;
  readonly steps: ReadonlyArray<StepResult>;
  readonly duration: number;
}

/** 工作流注册表 */
export type WorkflowRegistry = ReadonlyMap<string, WorkflowDef>;

/** 工作流分类 */
export type WorkflowCategory =
  | "project"
  | "phase"
  | "quality"
  | "debug"
  | "docs"
  | "research"
  | "execution"
  | "daily"
  | "management"
  | "tools"
  | "other";
