/**
 * Command 引擎类型定义
 * 将 commands/*.md 转化为可注册到 CLI 的命令
 */

/** 命令参数定义 */
export interface CommandParam {
  readonly name: string;
  readonly description: string;
  readonly required: boolean;
  readonly default?: string;
}

/** 命令定义（从 markdown 解析） */
export interface CommandDef {
  readonly name: string;
  readonly description: string;
  readonly skill: string;
  readonly trigger: string;
  readonly category: string;
  readonly params: ReadonlyArray<CommandParam>;
  readonly usage: string;
  readonly location: string;
}

/** 命令执行上下文 */
export interface CommandContext {
  readonly cwd: string;
  readonly args: ReadonlyMap<string, string>;
  readonly stdout: (msg: string) => void;
  readonly stderr: (msg: string) => void;
}

/** 命令注册表 */
export type CommandRegistry = ReadonlyMap<string, CommandDef>;

/** 命令分类 */
export type CommandCategory =
  | "plan"
  | "review"
  | "project"
  | "debug"
  | "docs"
  | "workflow"
  | "settings"
  | "explore"
  | "daily"
  | "change"
  | "tools"
  | "other";
