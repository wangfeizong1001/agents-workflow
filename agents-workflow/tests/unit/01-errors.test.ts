import { describe, it, expect } from "vitest";
import { YunShouError, YSErrorCode } from "../../src/shared/errors.js";

describe("YunShouError", () => {
  it("必须继承自 Error 且 name 为 YunShouError", () => {
    const e = new YunShouError("test", YSErrorCode.UNKNOWN, {});
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBe("YunShouError");
  });

  it("必须携带 code、context、cause 三个额外字段", () => {
    const cause = new Error("root");
    const e = new YunShouError("顶层消息", YSErrorCode.FS_READ_FAILED, { path: "/a" }, cause);
    expect(e.code).toBe(YSErrorCode.FS_READ_FAILED);
    expect(e.context).toEqual({ path: "/a" });
    expect(e.cause).toBe(cause);
    expect(e.message).toBe("顶层消息");
  });

  it("必须能以 JSON 形式序列化,便于错误事件持久化", () => {
    const e = new YunShouError("x", YSErrorCode.YAML_PARSE_FAILED, { line: 3 });
    const json = e.toJSON();
    expect(json).toMatchObject({
      name: "YunShouError",
      code: "YAML_PARSE_FAILED",
      message: "x",
      context: { line: 3 },
    });
    expect(typeof json.stack).toBe("string");
  });

  it("YunShouError.from() 必须能将任意 Error 包成 YunShouError", () => {
    const root = new Error("磁盘炸了");
    const wrapped = YunShouError.from(root, YSErrorCode.FS_WRITE_FAILED, { path: "/x" });
    expect(wrapped).toBeInstanceOf(YunShouError);
    expect(wrapped.cause).toBe(root);
    expect(wrapped.context).toEqual({ path: "/x" });
  });

  it("YunShouError.from() 对 YunShouError 实例应当保留原 code", () => {
    const original = new YunShouError("原", YSErrorCode.GUARD_REJECTED);
    const wrapped = YunShouError.from(original, YSErrorCode.UNKNOWN);
    expect(wrapped.code).toBe(YSErrorCode.GUARD_REJECTED);
    expect(wrapped.cause).toBe(original);
  });
});
