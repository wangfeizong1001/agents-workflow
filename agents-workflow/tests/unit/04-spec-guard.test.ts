import { describe, it, expect } from "vitest";
import { SpecGuard, type SpecState } from "../../src/core/guard/spec-guard.js";
import { YunShouError } from "../../src/shared/errors.js";

const base = (over: Partial<SpecState> = {}): SpecState => ({
  id: "s1",
  title: "标题",
  phase: "draft",
  body: "x".repeat(200),
  hasQuestions: false,
  hasDecisions: true,
  scenarioCount: 3,
  ...over,
});

describe("SpecGuard", () => {
  it("draft → review 需要至少 200 字正文 + 3 个场景", () => {
    const g = new SpecGuard();
    expect(() => g.assertCanAdvance(base())).not.toThrow();
    expect(() => g.assertCanAdvance(base({ body: "短" }))).toThrow(YunShouError);
    expect(() => g.assertCanAdvance(base({ scenarioCount: 1 }))).toThrow(YunShouError);
  });

  it("review → approved 需要 hasDecisions=true", () => {
    const g = new SpecGuard();
    const ok = base({ phase: "review", scenarioCount: 5, hasDecisions: true });
    expect(() => g.assertCanAdvance(ok)).not.toThrow();
    expect(() => g.assertCanAdvance(base({ phase: "review", hasDecisions: false }))).toThrow();
  });

  it("approved → archived 需要标题 ≤ 80 字", () => {
    const g = new SpecGuard();
    expect(() => g.assertCanAdvance(base({ phase: "approved", title: "OK" }))).not.toThrow();
    expect(() =>
      g.assertCanAdvance(base({ phase: "approved", title: "x".repeat(100) })),
    ).toThrow();
  });

  it("非法阶段跳跃 (例如 draft→approved) 必须拒绝", () => {
    const g = new SpecGuard();
    expect(() => g.assertCanAdvance(base({ phase: "draft" }), "approved")).toThrow();
  });
});
