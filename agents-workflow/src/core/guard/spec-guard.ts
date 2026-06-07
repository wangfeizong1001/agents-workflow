import { YunShouError, YSErrorCode } from "../../shared/errors.js";
import type { SpecPhase, SpecState } from "./types.js";

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
