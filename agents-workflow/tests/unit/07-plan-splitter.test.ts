import { describe, it, expect } from "vitest";
import { splitPlan } from "../../src/core/plan/splitter.js";
import { YunShouError } from "../../src/shared/errors.js";

describe("计划任务拆分", () => {
  it("必须按 ## 任务 标题拆出任务", () => {
    const md = `
# 计划

## 任务 1: 配置脚手架
- 创建 package.json
- 写 tsconfig.json

## 任务 2: 写工具函数
- 实现 logger
`;
    const tasks = splitPlan(md, "p1");
    expect(tasks).toHaveLength(2);
    expect(tasks[0]?.id).toBe("p1.T1");
    expect(tasks[0]?.title).toContain("配置脚手架");
    expect(tasks[0]?.bullets).toHaveLength(2);
  });

  it("无任务标题时必须抛错", () => {
    expect(() => splitPlan("# 没有任务\n", "p1")).toThrow(YunShouError);
  });

  it("任务内 - 列表项必须被识别为 bullets", () => {
    const md = "## 任务 1: A\n- x\n- y\n- z\n";
    const tasks = splitPlan(md, "p1");
    expect(tasks[0]?.bullets).toEqual(["x", "y", "z"]);
  });

  it("任务依赖链: T1 无依赖, T2+ 依赖前一任务", () => {
    const md = "## 任务 1: A\n- x\n## 任务 2: B\n- y\n## 任务 3: C\n- z\n";
    const tasks = splitPlan(md, "p1");
    expect(tasks[0]?.dependsOn).toEqual([]);
    // T2 依赖于 T1, T3 依赖于 T2
    expect(tasks[1]?.dependsOn).toEqual(["p1.T1"]);
    expect(tasks[2]?.dependsOn).toEqual(["p1.T2"]);
  });

  it("fileHints 必须从反引号路径中提取", () => {
    const md = "## 任务 1: A\n- 修改 `src/main.ts` 与 `src/utils.ts`\n- 更新 `config.yaml`\n";
    const tasks = splitPlan(md, "p1");
    expect(tasks[0]?.fileHints).toContain("src/main.ts");
    expect(tasks[0]?.fileHints).toContain("src/utils.ts");
    expect(tasks[0]?.fileHints).toContain("config.yaml");
  });
});
