export const YSErrorCode = {
  UNKNOWN: "UNKNOWN",
  FS_READ_FAILED: "FS_READ_FAILED",
  FS_WRITE_FAILED: "FS_WRITE_FAILED",
  FS_NOT_FOUND: "FS_NOT_FOUND",
  YAML_PARSE_FAILED: "YAML_PARSE_FAILED",
  YAML_VALIDATION_FAILED: "YAML_VALIDATION_FAILED",
  JSONL_CORRUPTED: "JSONL_CORRUPTED",
  STATE_INVALID_TRANSITION: "STATE_INVALID_TRANSITION",
  GUARD_REJECTED: "GUARD_REJECTED",
  SPEC_PHASE_INVALID: "SPEC_PHASE_INVALID",
  SPEC_QUALITY_GATE_FAILED: "SPEC_QUALITY_GATE_FAILED",
  PLAN_DAG_CYCLE: "PLAN_DAG_CYCLE",
  PLAN_TASK_TOO_LARGE: "PLAN_TASK_TOO_LARGE",
  EXECUTE_NO_READY_TASK: "EXECUTE_NO_READY_TASK",
  VERIFY_LAYER_FAILED: "VERIFY_LAYER_FAILED",
  ADAPTER_NOT_SUPPORTED: "ADAPTER_NOT_SUPPORTED",
  CLI_INVALID_ARGS: "CLI_INVALID_ARGS",
} as const;

export type YSErrorCode = (typeof YSErrorCode)[keyof typeof YSErrorCode];

export interface YSErrorJSON {
  readonly name: "YunShouError";
  readonly code: YSErrorCode;
  readonly message: string;
  readonly context: Readonly<Record<string, unknown>>;
  readonly stack: string;
  readonly cause?: string;
}

export class YunShouError extends Error {
  public readonly code: YSErrorCode;
  public readonly context: Readonly<Record<string, unknown>>;
  public override readonly cause?: Error;

  constructor(
    message: string,
    code: YSErrorCode = YSErrorCode.UNKNOWN,
    context: Readonly<Record<string, unknown>> = {},
    cause?: Error,
  ) {
    super(message);
    this.name = "YunShouError";
    this.code = code;
    this.context = context;
    if (cause !== undefined) this.cause = cause;
  }

  public toJSON(): YSErrorJSON {
    return {
      name: "YunShouError",
      code: this.code,
      message: this.message,
      context: this.context,
      stack: this.stack ?? "",
      ...(this.cause !== undefined ? { cause: this.cause.message } : {}),
    };
  }

  public static from(
    err: unknown,
    code: YSErrorCode = YSErrorCode.UNKNOWN,
    context: Readonly<Record<string, unknown>> = {},
  ): YunShouError {
    if (err instanceof YunShouError) {
      return new YunShouError(err.message, err.code, err.context, err);
    }
    if (err instanceof Error) {
      return new YunShouError(err.message, code, context, err);
    }
    return new YunShouError(String(err), code, context);
  }
}
