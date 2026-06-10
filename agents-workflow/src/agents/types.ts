/**
 * Agent 引擎类型定义
 * 将 agents/*.md 转化为可派生的子代理
 */

/** Agent 类型 */
export type AgentType =
  | "independent"
  | "analysis"
  | "review"
  | "planning"
  | "doc"
  | "debug"
  | "ui"
  | "integration"
  | "other";

/** Agent 定义（从 markdown 解析） */
export interface AgentDef {
  readonly name: string;
  readonly type: AgentType;
  readonly description: string;
  readonly input: string;
  readonly output: string;
  readonly tools: ReadonlyArray<string>;
  readonly instructions: string;
  readonly location: string;
}

/** Agent 执行上下文 */
export interface AgentContext {
  readonly cwd: string;
  readonly args: ReadonlyArray<string>;
  readonly env: ReadonlyMap<string, string>;
}

/** Agent 执行结果 */
export interface AgentResult {
  readonly agent: string;
  readonly success: boolean;
  readonly output: string;
  readonly duration: number;
}

/** Agent 注册表 */
export type AgentRegistry = ReadonlyMap<string, AgentDef>;
