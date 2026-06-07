export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_RANK: Readonly<Record<LogLevel, number>> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export interface LoggerOptions {
  readonly level: LogLevel;
  readonly context?: Readonly<Record<string, unknown>>;
}

export interface Logger {
  debug(msg: string, context?: Record<string, unknown>): void;
  info(msg: string, context?: Record<string, unknown>): void;
  warn(msg: string, context?: Record<string, unknown>): void;
  error(msg: string, err?: unknown, context?: Record<string, unknown>): void;
  child(context: Record<string, unknown>): Logger;
}

export function createLogger(opts: LoggerOptions): Logger {
  return new ConsoleLogger(opts.level, opts.context ?? {});
}

class ConsoleLogger implements Logger {
  private readonly context: Readonly<Record<string, unknown>>;

  constructor(
    private readonly level: LogLevel,
    context: Readonly<Record<string, unknown>>,
  ) {
    this.context = context;
  }

  public debug(msg: string, ctx: Record<string, unknown> = {}): void {
    this.emit("debug", msg, ctx, undefined);
  }

  public info(msg: string, ctx: Record<string, unknown> = {}): void {
    this.emit("info", msg, ctx, undefined);
  }

  public warn(msg: string, ctx: Record<string, unknown> = {}): void {
    this.emit("warn", msg, ctx, undefined);
  }

  public error(msg: string, err?: unknown, ctx: Record<string, unknown> = {}): void {
    this.emit("error", msg, ctx, err);
  }

  public child(ctx: Record<string, unknown>): Logger {
    return new ConsoleLogger(this.level, { ...this.context, ...ctx });
  }

  private emit(
    level: LogLevel,
    msg: string,
    ctx: Record<string, unknown>,
    err: unknown,
  ): void {
    if (LEVEL_RANK[level] < LEVEL_RANK[this.level]) return;

    const payload: Record<string, unknown> = {
      ts: new Date().toISOString(),
      level,
      msg,
      ...this.context,
      ...ctx,
    };
    if (err !== undefined) {
      payload.err =
        err instanceof Error
          ? { name: err.name, message: err.message, stack: err.stack }
          : err;
    }

    const line = `${JSON.stringify(payload)}\n`;
    process.stderr.write(line);
  }
}
