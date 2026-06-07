// 模块职责: 定义 CLI 子命令与处理器共享的契约类型。
// 接口契约:
// - CliContext: 命令处理器的标准入参(参数 / 工作目录 / 输出通道),所有通道均为只读以防命令意外写入上下文。
// - CliHandler: 命令处理函数,允许同步或异步,返回进程退出码。
// - CliCommand: 命令元数据(name / description / handler),用于 Commander 注册。

export interface CliContext {
  readonly args: readonly string[];
  readonly cwd: string;
  readonly stdout: (s: string) => void;
  readonly stderr: (s: string) => void;
}

export type CliHandler = (ctx: CliContext) => Promise<number> | number;

export interface CliCommand {
  readonly name: string;
  readonly description: string;
  readonly handler: CliHandler;
}
