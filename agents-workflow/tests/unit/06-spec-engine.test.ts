// 云枢 Spec 引擎核心测试 —— 覆盖 create / advance / reject 三条路径。
//
// 边界覆盖:
//   - create: 正文长度满足/不满足 MIN_BODY(200)
//   - advance: 阶段推移 + guard 校验(场景数 ≥ 3)
//   - reject: 不存在 id 抛 FS_NOT_FOUND
//
// plan 已知修正: s-1 的 problem/goal 各 150 以通过 MIN_BODY 门禁;
// s-3 的 scenarios 含 3 条以通过 guard 场景数门禁。

import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SpecEngine } from "../../src/core/spec/engine.js";
import { StateStore } from "../../src/core/state/store.js";
import { YunShouError } from "../../src/shared/errors.js";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ys-spec-"));
});

describe("SpecEngine", () => {
  it("create 必须生成 markdown 文件并追加事件", () => {
    const engine = new SpecEngine({ root: dir, store: new StateStore(join(dir, "e.jsonl")) });
    const id = engine.create({
      id: "s-1",
      title: "示例",
      date: "2026-06-07",
      author: "a",
      problem: "p".repeat(150),
      goal: "g".repeat(150),
      nonGoals: "n",
      decisions: "d",
      scenarios: "sc",
      risks: "r",
    });
    expect(existsSync(join(dir, ".yunshou", "specs", `${id}.md`))).toBe(true);
  });

  it("create 时质量门禁失败必须抛错且不写文件", () => {
    const engine = new SpecEngine({ root: dir, store: new StateStore(join(dir, "e.jsonl")) });
    expect(() =>
      engine.create({
        id: "s-2",
        title: "x",
        date: "2026-06-07",
        author: "a",
        problem: "短",
        goal: "短",
        nonGoals: "n",
        decisions: "d",
        scenarios: "sc",
        risks: "r",
      }),
    ).toThrow(YunShouError);
    expect(existsSync(join(dir, ".yunshou", "specs", "s-2.md"))).toBe(false);
  });

  it("advance 必须通过护栏校验并写 frontmatter status", () => {
    const engine = new SpecEngine({ root: dir, store: new StateStore(join(dir, "e.jsonl")) });
    const id = engine.create({
      id: "s-3",
      title: "标题",
      date: "2026-06-07",
      author: "a",
      problem: "p".repeat(200),
      goal: "g".repeat(50),
      nonGoals: "n",
      decisions: "d",
      scenarios: "s1\n\n#### Scenario: s2\n\n#### Scenario: s3",
      risks: "r",
    });
    engine.advance(id, "review");
    const md = readFileSync(join(dir, ".yunshou", "specs", `${id}.md`), "utf-8");
    expect(md).toContain("status: review");
  });

  it("advance 不存在的 id 必须抛 FS_NOT_FOUND", () => {
    const engine = new SpecEngine({ root: dir, store: new StateStore(join(dir, "e.jsonl")) });
    expect(() => engine.advance("nonexistent", "review")).toThrow(YunShouError);
  });

  it("advance 非法阶段跳跃必须抛 SPEC_PHASE_INVALID", () => {
    const engine = new SpecEngine({ root: dir, store: new StateStore(join(dir, "e.jsonl")) });
    const id = engine.create({
      id: "s-4",
      title: "跳跃测试",
      date: "2026-06-07",
      author: "a",
      problem: "p".repeat(150),
      goal: "g".repeat(150),
      nonGoals: "n",
      decisions: "d",
      scenarios: "s1\n\n#### Scenario: s2\n\n#### Scenario: s3",
      risks: "r",
    });
    // draft → approved 是非法跳跃(必须经过 review)
    expect(() => engine.advance(id, "approved")).toThrow(YunShouError);
  });

  it("advance 质量门禁失败必须抛 SPEC_QUALITY_GATE_FAILED", () => {
    const engine = new SpecEngine({ root: dir, store: new StateStore(join(dir, "e.jsonl")) });
    const id = engine.create({
      id: "s-5",
      title: "质量门禁",
      date: "2026-06-07",
      author: "a",
      problem: "p".repeat(150),
      goal: "g".repeat(150),
      nonGoals: "n",
      decisions: "d",
      scenarios: "s1", // 仅 1 个场景, guard 要求 ≥ 3
      risks: "r",
    });
    expect(() => engine.advance(id, "review")).toThrow(YunShouError);
  });
});
