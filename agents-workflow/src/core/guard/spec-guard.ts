// 云枢 Guard 子系统 —— Spec 阶段流转硬护栏 (阶段 4 任务 16)。
//
// 4 态规格阶段 (draft / review / approved / archived) 的硬护栏,
// 在用户未达前置条件时阻止状态流转,并以 YunShouError 解释原因。
//
// 转移表 ALLOWED 语义 (单一事实源,所有判断都查此表):
//
//   draft     → [review, archived]      // 正向走 review;或一次性直接归档
//   review    → [approved, draft]      // 正向走 approved;或回退到 draft 修订
//   approved  → [archived]             // 终态前最后一跳
//   archived  → []                     // 终态,无出向
//
// assertCanAdvance(state, to?) 行为:
//   - 显式传 to: 必须命中 ALLOWED[from] 白名单,否则抛 SPEC_PHASE_INVALID
//   - 不传 to (undefined): 取 ALLOWED[from][0] 作为默认下一阶段
//     当前 ALLOWED 表的设计是 [正向, 回退/特殊],故 nextOf 总返回"主路径"
//   - nextOf 对 archived 终态返 undefined,触发"无合法下一阶段"错误
//
// 3 个质量门禁 (assertXxxQuality / assertXxxShape):
//   - assertDraftQuality:   draft→review 需 body≥200 字 + scenarioCount≥3
//   - assertReviewQuality:  review→approved 需 hasDecisions=true
//   - assertApprovedShape:  approved→archived 需 title≤80 字
//   任意门禁不通过抛 SPEC_QUALITY_GATE_FAILED,context 含具体阈值
//
// plan 已知局限 (留到后续任务扩展):
//   - 缺失 plan / execute / task-flow 3 套护栏;留到阶段 5 任务 17+ 接入
//   - hasQuestions 字段当前不消费,锁定为非影响性字段 (见测试 hasQuestions
//     字段非影响性契约)
//   - nextOf 依赖 ALLOWED[p] 数组顺序,若需不同默认推进策略请显式传 to

import { YunShouError, YSErrorCode } from "../../shared/errors.js";
import type { SpecPhase, SpecState } from "./types.js";

// 任务 16 审查修正 (合规审查 HIGH): re-export types,让 04-spec-guard.test.ts
// 可以从 spec-guard.js 拿到 SpecState 类型 (plan 16.1 与 16.3 自相矛盾的解决方案 A)
export type { SpecPhase, SpecState } from "./types.js";

const ALLOWED: Readonly<Record<SpecPhase, readonly SpecPhase[]>> = {
  draft: ["review", "archived"],
  review: ["approved", "draft"],
  approved: ["archived"],
  archived: [],
};

export class SpecGuard {
  public assertCanAdvance(state: SpecState, to?: SpecPhase): void {
    const target = to ?? this.nextOf(state.phase);
    if (!target) {
      throw new YunShouError(
        "无合法下一阶段",
        YSErrorCode.SPEC_PHASE_INVALID,
        { from: state.phase, id: state.id },
      );
    }
    if (!ALLOWED[state.phase].includes(target)) {
      throw new YunShouError(
        "非法阶段跳跃",
        YSErrorCode.SPEC_PHASE_INVALID,
        { from: state.phase, to: target },
      );
    }
    if (state.phase === "draft" && target === "review") {
      this.assertDraftQuality(state);
    } else if (state.phase === "review" && target === "approved") {
      this.assertReviewQuality(state);
    } else if (state.phase === "approved" && target === "archived") {
      this.assertApprovedShape(state);
    }
  }

  private nextOf(p: SpecPhase): SpecPhase | undefined {
    return ALLOWED[p][0];
  }

  private assertDraftQuality(s: SpecState): void {
    if (s.body.length < 200) {
      throw new YunShouError("正文过短", YSErrorCode.SPEC_QUALITY_GATE_FAILED, {
        length: s.body.length,
        min: 200,
      });
    }
    if (s.scenarioCount < 3) {
      throw new YunShouError("场景数不足", YSErrorCode.SPEC_QUALITY_GATE_FAILED, {
        scenarioCount: s.scenarioCount,
        min: 3,
      });
    }
  }

  private assertReviewQuality(s: SpecState): void {
    if (!s.hasDecisions) {
      throw new YunShouError(
        "未记录决策",
        YSErrorCode.SPEC_QUALITY_GATE_FAILED,
        { id: s.id },
      );
    }
  }

  private assertApprovedShape(s: SpecState): void {
    if (s.title.length > 80) {
      throw new YunShouError("标题过长", YSErrorCode.SPEC_QUALITY_GATE_FAILED, {
        length: s.title.length,
        max: 80,
      });
    }
  }
}
