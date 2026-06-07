import { describe, it, expect } from "vitest";
import { renderSpecTemplate } from "../../src/core/spec/template.js";

describe("Spec 模板", () => {
  it("必须渲染所有占位符", () => {
    const out = renderSpecTemplate({
      id: "s-1",
      title: "示例规格",
      date: "2026-06-07",
      author: "alice",
      problem: "P",
      goal: "G",
      nonGoals: "NG",
      decisions: "D1",
      scenarios: "S1",
      risks: "R1",
    });
    expect(out).toContain("id: s-1");
    expect(out).toContain("# 示例规格");
    expect(out).toContain("#### Scenario: S1");
    expect(out).toContain("| D1 |");
  });

  it("缺少必填字段必须抛错", () => {
    expect(() =>
      renderSpecTemplate({
        id: "s-1",
        title: "",
        date: "2026-06-07",
        author: "a",
        problem: "p",
        goal: "g",
        nonGoals: "ng",
        decisions: "d",
        scenarios: "s",
        risks: "r",
      }),
    ).toThrow();
  });
});
