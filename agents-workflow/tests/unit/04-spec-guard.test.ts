// 云枢 Guard 子系统 —— Spec 阶段流转硬护栏的 TDD 验证用例 (阶段 4 任务 16)。
//
// 覆盖 4 态合法/非法转移 + 3 个质量门禁失败路径 + 边界临界值 + 默认推进契约,
// 作为 SpecGuard 公开 API 的契约锁定,供任务 19 SpecEngine 接入时直接复用。
//
// 测试分层:
//   - 1) 原有 4 个 plan 锁定用例 (含强断言 .code)
//   - 2) 4 态 × 4 转移穷尽性基线 (锁定所有 from/to 组合,合法 5 对通过,非法 11 对拒绝)
//   - 3) 精确边界值 (200/199、3/2、80/81 的 off-by-one)
//   - 4) 默认推进 (to=undefined) 的 nextOf 契约 (含 archived 终态负向)
//   - 5) hasQuestions 字段非影响性契约 (锁定该字段不被消费)
//   - 6) 错误码与上下文字段锁定 (for 任务 19 UX 分流)
//
// plan 16.1 中测试集只覆盖 4 用例,本文件在任务 16 审查后扩展为 12 用例。

import { describe, it, expect } from "vitest";
import { YSErrorCode, YunShouError } from "../../src/shared/errors.js";
import { SpecGuard, type SpecState, type SpecPhase } from "../../src/core/guard/spec-guard.js";

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

// 辅助:捕获异常并断言 YunShouError + code 强断言
// 备注:`as YunShouError` 是必要的类型收窄 (unknown → YunShouError),非反模式
function captureThrow(fn: () => void): YunShouError {
  let caught: unknown = null;
  try {
    fn();
  } catch (e) {
    caught = e;
  }
  expect(caught).toBeInstanceOf(YunShouError);
  return caught as YunShouError;
}

describe("SpecGuard", () => {
  // ========== (1) plan 16.1 锁定的 4 个基础用例 + 强断言 ==========

  it("draft → review 需要至少 200 字正文 + 3 个场景", () => {
    const g = new SpecGuard();
    expect(() => g.assertCanAdvance(base())).not.toThrow();
    expect(captureThrow(() => g.assertCanAdvance(base({ body: "短" }))).code).toBe(
      YSErrorCode.SPEC_QUALITY_GATE_FAILED,
    );
    expect(captureThrow(() => g.assertCanAdvance(base({ scenarioCount: 1 }))).code).toBe(
      YSErrorCode.SPEC_QUALITY_GATE_FAILED,
    );
  });

  it("review → approved 需要 hasDecisions=true", () => {
    const g = new SpecGuard();
    const ok = base({ phase: "review", scenarioCount: 5, hasDecisions: true });
    expect(() => g.assertCanAdvance(ok)).not.toThrow();
    expect(
      captureThrow(() => g.assertCanAdvance(base({ phase: "review", hasDecisions: false }))).code,
    ).toBe(YSErrorCode.SPEC_QUALITY_GATE_FAILED);
  });

  it("approved → archived 需要标题 ≤ 80 字", () => {
    const g = new SpecGuard();
    expect(() => g.assertCanAdvance(base({ phase: "approved", title: "OK" }))).not.toThrow();
    expect(
      captureThrow(() =>
        g.assertCanAdvance(base({ phase: "approved", title: "x".repeat(100) })),
      ).code,
    ).toBe(YSErrorCode.SPEC_QUALITY_GATE_FAILED);
  });

  it("非法阶段跳跃 (例如 draft→approved) 必须拒绝", () => {
    const g = new SpecGuard();
    expect(captureThrow(() => g.assertCanAdvance(base({ phase: "draft" }), "approved")).code).toBe(
      YSErrorCode.SPEC_PHASE_INVALID,
    );
  });

  // ========== (2) 4 态 × 4 转移穷尽性基线 ==========

  it("穷尽性: 4 态 × 4 转移 (含自环) 全 16 对,合法 5 对通过,非法 11 对拒绝", () => {
    const g = new SpecGuard();
    const phases: readonly SpecPhase[] = ["draft", "review", "approved", "archived"];
    // 锁定合法对 (5 个):
    //   draft→review / review→approved / approved→archived / draft→archived / review→draft
    const legalPairs: ReadonlyArray<readonly [SpecPhase, SpecPhase]> = [
      ["draft", "review"],
      ["review", "approved"],
      ["approved", "archived"],
      ["draft", "archived"],
      ["review", "draft"],
    ];
    // 反向: 自环 4 对 + 不在合法表里的跨态跳转 7 对
    const allPairs: Array<readonly [SpecPhase, SpecPhase]> = [];
    for (const from of phases) {
      for (const to of phases) {
        allPairs.push([from, to] as const);
      }
    }
    expect(allPairs.length).toBe(16);
    expect(legalPairs.length).toBe(5);
    expect(16 - 5).toBe(11);

    // 准备每个 from 态下的合法下一态集合 (用于最小化快乐路径状态配置)
    const setupFor = (from: SpecPhase): Partial<SpecState> => {
      if (from === "draft") return { body: "x".repeat(200), scenarioCount: 3 };
      if (from === "review") return { hasDecisions: true };
      if (from === "approved") return { title: "OK" };
      return {};
    };

    for (const [from, to] of allPairs) {
      const isLegal = legalPairs.some(([f, t]) => f === from && t === to);
      const state = base({ phase: from, ...setupFor(from) });
      if (isLegal) {
        expect(() => g.assertCanAdvance(state, to)).not.toThrow();
      } else {
        // 自环 (from === to) 与所有跨态非法跳跃必须抛 SPEC_PHASE_INVALID
        expect(captureThrow(() => g.assertCanAdvance(state, to)).code).toBe(
          YSErrorCode.SPEC_PHASE_INVALID,
        );
      }
    }
  });

  // ========== (3) 精确边界值 (off-by-one) ==========

  it("边界值: body.length=200 通过,=199 拒绝 (锁定 ≥ 语义)", () => {
    const g = new SpecGuard();
    expect(() => g.assertCanAdvance(base({ body: "x".repeat(200) }))).not.toThrow();
    expect(
      captureThrow(() => g.assertCanAdvance(base({ body: "x".repeat(199) }))).code,
    ).toBe(YSErrorCode.SPEC_QUALITY_GATE_FAILED);
  });

  it("边界值: scenarioCount=3 通过,=2 拒绝 (锁定 ≥ 语义)", () => {
    const g = new SpecGuard();
    expect(() => g.assertCanAdvance(base({ scenarioCount: 3 }))).not.toThrow();
    expect(captureThrow(() => g.assertCanAdvance(base({ scenarioCount: 2 }))).code).toBe(
      YSErrorCode.SPEC_QUALITY_GATE_FAILED,
    );
  });

  it("边界值: title.length=80 通过,=81 拒绝 (锁定 ≤ 语义)", () => {
    const g = new SpecGuard();
    expect(() => g.assertCanAdvance(base({ phase: "approved", title: "x".repeat(80) }))).not.toThrow();
    expect(
      captureThrow(() =>
        g.assertCanAdvance(base({ phase: "approved", title: "x".repeat(81) })),
      ).code,
    ).toBe(YSErrorCode.SPEC_QUALITY_GATE_FAILED);
  });

  // ========== (4) 默认推进 (to=undefined) 走 nextOf 的契约 ==========

  it("nextOf 契约: draft 态默认走 review (ALLOWED[draft][0])", () => {
    const g = new SpecGuard();
    // 等价断言:不传 to 与显式传 "review" 行为完全一致
    const state = base({ phase: "draft" });
    expect(() => g.assertCanAdvance(state)).not.toThrow();
    expect(() => g.assertCanAdvance(state, "review")).not.toThrow();
  });

  it("nextOf 契约: archived 终态默认推进抛 SPEC_PHASE_INVALID (无合法下一阶段)", () => {
    const g = new SpecGuard();
    const state = base({ phase: "archived" });
    // 不传 to: nextOf("archived") 返 undefined → 抛"无合法下一阶段"
    expect(captureThrow(() => g.assertCanAdvance(state)).code).toBe(YSErrorCode.SPEC_PHASE_INVALID);
  });

  // ========== (5) hasQuestions 字段非影响性契约 ==========

  it("hasQuestions 字段非影响性: 守卫结果与 hasQuestions 取值无关", () => {
    const g = new SpecGuard();
    // draft→review 快乐路径,hasQuestions 取 true/false 均应通过
    expect(() => g.assertCanAdvance(base({ hasQuestions: true }))).not.toThrow();
    expect(() => g.assertCanAdvance(base({ hasQuestions: false }))).not.toThrow();
    // review→approved 快乐路径同样
    const reviewBase = base({ phase: "review", hasDecisions: true });
    expect(() => g.assertCanAdvance({ ...reviewBase, hasQuestions: true })).not.toThrow();
    expect(() => g.assertCanAdvance({ ...reviewBase, hasQuestions: false })).not.toThrow();
  });

  // ========== (6) 错误上下文字段锁定 (for 任务 19 UX 分流) ==========

  it("错误上下文: 非法跳跃的 context 含 from/to 字段", () => {
    const g = new SpecGuard();
    const err = captureThrow(() => g.assertCanAdvance(base({ phase: "draft" }), "approved"));
    expect(err.context).toMatchObject({ from: "draft", to: "approved" });
  });

  it("错误上下文: 正文过短的 context 含 length/min 字段", () => {
    const g = new SpecGuard();
    const err = captureThrow(() => g.assertCanAdvance(base({ body: "短" })));
    expect(err.context).toMatchObject({ length: 1, min: 200 });
  });
});
