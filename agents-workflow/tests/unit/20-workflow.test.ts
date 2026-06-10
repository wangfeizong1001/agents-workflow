import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  parseWorkflowContent,
  scanWorkflows,
  loadAllWorkflows,
  WorkflowExecutor,
} from "../../src/workflow/index.js";

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ys-workflow-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

const SAMPLE_WORKFLOW = `---
name: 测试工作流
description: 一个测试工作流
stages: [准备, 执行, 验证]
estimated-time: 10分钟
category: 质量类
---

## 测试工作流

### 阶段 1：准备

- ① health → 执行健康检查
- 门禁：检查完成

### 阶段 2：执行

- ② code-review → 代码评审
- 门禁：评审完成

### 阶段 3：验证

- ③ qa → 运行测试
- 门禁：测试通过
`;

describe("Workflow 引擎", () => {
  it("parseWorkflowContent 应解析 frontmatter", () => {
    const def = parseWorkflowContent(SAMPLE_WORKFLOW, "/test.md");
    expect(def.name).toBe("测试工作流");
    expect(def.description).toBe("一个测试工作流");
    expect(def.category).toBe("质量类");
    expect(def.estimatedTime).toBe("10分钟");
    expect(def.location).toBe("/test.md");
  });

  it("parseWorkflowContent 应解析步骤", () => {
    const def = parseWorkflowContent(SAMPLE_WORKFLOW, "/test.md");
    expect(def.steps).toHaveLength(3);
    expect(def.steps[0]?.command).toBe("health");
    expect(def.steps[0]?.name).toBe("执行健康检查");
    expect(def.steps[1]?.command).toBe("code-review");
    expect(def.steps[2]?.command).toBe("qa");
  });

  it("scanWorkflows 应扫描目录下所有工作流", () => {
    writeFileSync(join(dir, "health.md"), SAMPLE_WORKFLOW, "utf-8");
    writeFileSync(
      join(dir, "debug.md"),
      `---
name: 调试
description: 调试工作流
category: 调试类
---

## 调试

- ① debug → 调试问题
`,
      "utf-8",
    );

    const workflows = scanWorkflows(dir);
    expect(workflows).toHaveLength(2);
  });

  it("scanWorkflows 应忽略非 md 文件", () => {
    writeFileSync(join(dir, "health.md"), SAMPLE_WORKFLOW, "utf-8");
    writeFileSync(join(dir, "readme.txt"), "not a workflow", "utf-8");

    const workflows = scanWorkflows(dir);
    expect(workflows).toHaveLength(1);
  });

  it("loadAllWorkflows 应返回注册表", () => {
    writeFileSync(join(dir, "health.md"), SAMPLE_WORKFLOW, "utf-8");

    const registry = loadAllWorkflows(dir);
    expect(registry.size).toBe(1);
    expect(registry.has("测试工作流")).toBe(true);
  });

  it("WorkflowExecutor 应执行已注册的处理器", async () => {
    const executor = new WorkflowExecutor();
    const results: string[] = [];
    executor.registerHandler("health", async () => {
      results.push("health");
      return "健康检查完成";
    });
    executor.registerHandler("code-review", async () => {
      results.push("code-review");
      return "评审完成";
    });
    executor.registerHandler("qa", async () => {
      results.push("qa");
      return "测试完成";
    });

    const def = parseWorkflowContent(SAMPLE_WORKFLOW, "/test.md");
    const result = await executor.execute(def);

    expect(result.success).toBe(true);
    expect(result.steps).toHaveLength(3);
    expect(results).toEqual(["health", "code-review", "qa"]);
  });

  it("WorkflowExecutor 应处理未注册的处理器", async () => {
    const executor = new WorkflowExecutor();
    const def = parseWorkflowContent(SAMPLE_WORKFLOW, "/test.md");
    const result = await executor.execute(def);

    expect(result.success).toBe(false);
    expect(result.steps[0]?.success).toBe(false);
    expect(result.steps[0]?.output).toContain("未找到处理器");
  });

  it("WorkflowExecutor 应处理执行错误", async () => {
    const executor = new WorkflowExecutor();
    executor.registerHandler("health", async () => {
      throw new Error("执行失败");
    });

    const def = parseWorkflowContent(SAMPLE_WORKFLOW, "/test.md");
    const result = await executor.execute(def);

    expect(result.success).toBe(false);
    expect(result.steps[0]?.success).toBe(false);
    expect(result.steps[0]?.output).toBe("执行失败");
  });
});
