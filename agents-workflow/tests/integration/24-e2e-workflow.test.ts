import { describe, it, expect } from "bun:test";
import { parseWorkflowContent, loadAllWorkflows } from "../../src/workflow/parser.js";
import { WorkflowExecutor } from "../../src/workflow/executor.js";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

describe("E2E 工作流集成测试", () => {
  const workflowsDir = join(import.meta.dir, "../../../workflow/workflows");

  it("完整流程: 解析 → 注册处理器 → 执行 → 验证结果", async () => {
    const content = `---
name: e2e-test-workflow
description: E2E 测试工作流
category: test
---
# E2E 测试工作流

- ① health → 执行健康检查
- ② diagnose-issues → 分析问题
- ③ session-report → 生成报告`;

    const def = parseWorkflowContent(content, "test.md");
    expect(def.name).toBe("e2e-test-workflow");
    expect(def.steps.length).toBe(3);

    const executor = new WorkflowExecutor();
    executor.registerHandler("health", async () => "健康检查通过");
    executor.registerHandler("diagnose-issues", async () => "发现 0 个问题");
    executor.registerHandler("session-report", async () => "报告已生成");

    const result = await executor.execute(def);

    expect(result.success).toBe(true);
    expect(result.workflow).toBe("e2e-test-workflow");
    expect(result.steps.length).toBe(3);
    expect(result.steps[0]!.success).toBe(true);
    expect(result.steps[0]!.output).toBe("健康检查通过");
    expect(result.steps[1]!.success).toBe(true);
    expect(result.steps[1]!.output).toBe("发现 0 个问题");
    expect(result.steps[2]!.success).toBe(true);
    expect(result.steps[2]!.output).toBe("报告已生成");
    expect(result.duration).toBeGreaterThanOrEqual(0);
  });

  it("真实工作流加载并执行", async () => {
    if (!existsSync(workflowsDir)) {
      return;
    }

    const registry = loadAllWorkflows(workflowsDir);
    expect(registry.size).toBeGreaterThan(0);

    const firstWorkflow = registry.values().next().value;
    expect(firstWorkflow).toBeDefined();
    expect(firstWorkflow!.name).toBeTruthy();
    expect(firstWorkflow!.steps.length).toBeGreaterThan(0);
  });

  it("处理器缺失时步骤失败", async () => {
    const content = `---
name: missing-handler
description: 缺失处理器测试
---
- ① nonexistent-command → 不存在的命令`;

    const def = parseWorkflowContent(content, "test.md");
    const executor = new WorkflowExecutor();
    const result = await executor.execute(def);

    expect(result.success).toBe(false);
    expect(result.steps[0]!.success).toBe(false);
    expect(result.steps[0]!.output).toContain("未找到处理器");
  });

  it("处理器异常时步骤失败但不中断", async () => {
    const content = `---
name: error-handler
description: 异常处理器测试
---
- ① failing-command → 会失败的命令
- ② health → 正常命令`;

    const def = parseWorkflowContent(content, "test.md");
    const executor = new WorkflowExecutor();
    executor.registerHandler("failing-command", async () => {
      throw new Error("模拟错误");
    });
    executor.registerHandler("health", async () => "正常");

    const result = await executor.execute(def);

    expect(result.success).toBe(false);
    expect(result.steps[0]!.success).toBe(false);
    expect(result.steps[0]!.output).toContain("模拟错误");
    expect(result.steps[1]!.success).toBe(true);
    expect(result.steps[1]!.output).toBe("正常");
  });

  it("所有工作流均能被正确解析", () => {
    if (!existsSync(workflowsDir)) {
      return;
    }

    const registry = loadAllWorkflows(workflowsDir);
    for (const [name, def] of registry) {
      expect(def.name).toBe(name);
      expect(typeof def.description).toBe("string");
      expect(def.steps.length).toBeGreaterThan(0);
    }
  });
});
