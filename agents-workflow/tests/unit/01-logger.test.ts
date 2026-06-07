import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createLogger, type LogLevel } from "../../src/shared/logger.js";

describe("Logger", () => {
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    stderrSpy.mockRestore();
  });

  it("debug 日志在 level=info 时不输出", () => {
    const log = createLogger({ level: "info" });
    log.debug("x");
    expect(stderrSpy).not.toHaveBeenCalled();
  });

  it("info 日志必须以 JSON 行格式输出到 stderr", () => {
    const log = createLogger({ level: "info" });
    log.info("hello", { user: "alice" });
    expect(stderrSpy).toHaveBeenCalledTimes(1);
    const out = String(stderrSpy.mock.calls[0]?.[0] ?? "");
    const parsed = JSON.parse(out.trim()) as Record<string, unknown>;
    expect(parsed.level).toBe("info");
    expect(parsed.msg).toBe("hello");
    expect(parsed.user).toBe("alice");
    expect(typeof parsed.ts).toBe("string");
  });

  it("error 日志必须包含 err 字段且 level=error", () => {
    const log = createLogger({ level: "error" });
    const err = new Error("boom");
    log.error("炸了", err, { taskId: "T1" });
    const out = String(stderrSpy.mock.calls[0]?.[0] ?? "");
    const parsed = JSON.parse(out.trim()) as Record<string, unknown>;
    expect(parsed.level).toBe("error");
    expect(parsed.err).toMatchObject({ message: "boom" });
    expect(parsed.taskId).toBe("T1");
  });

  it("child logger 必须继承父级 level 并合并 context", () => {
    const parent = createLogger({ level: "warn" });
    const child = parent.child({ requestId: "r-1" });
    child.warn("w");
    child.info("i");
    expect(stderrSpy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(
      String(stderrSpy.mock.calls[0]?.[0] ?? "").trim(),
    ) as Record<string, unknown>;
    expect(parsed.requestId).toBe("r-1");
  });

  it("所有 LogLevel 等级在表中必须被定义", () => {
    const levels: readonly LogLevel[] = ["debug", "info", "warn", "error"];
    for (const lv of levels) {
      const log = createLogger({ level: lv });
      log.debug("d");
      log.info("i");
      log.warn("w");
      log.error("e", new Error("x"));
      const parsed = JSON.parse(
        String(stderrSpy.mock.calls.at(-1)?.[0] ?? "").trim(),
      ) as { level: string };
      expect(parsed.level).toBeDefined();
    }
  });
});
