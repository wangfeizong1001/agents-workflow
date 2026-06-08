import { describe, it, expect } from "vitest";
import { L5Tester } from "../../src/l5-tester/index.js";

describe("L5Tester", () => {
  it("构造函数接受 root 路径", () => {
    const t = new L5Tester("/tmp");
    expect(t).toBeInstanceOf(L5Tester);
  });

  it("runFlow 返回 TestReport 形状对空步骤", async () => {
    const t = new L5Tester("/tmp");
    const report = await t.runFlow("about:blank", []);
    expect(report).toHaveProperty("passed");
    expect(Array.isArray(report.stages)).toBe(true);
    expect(report.stages.length).toBe(0);
  });
});
