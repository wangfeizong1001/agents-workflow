import { describe, it, expect } from "bun:test";
import { parseAgentContent, loadAllAgents } from "../../src/agents/loader.js";
import { AgentDispatcher } from "../../src/agents/dispatcher.js";
import { existsSync } from "node:fs";
import { join } from "node:path";

describe("E2E Agent 集成测试", () => {
  const agentsDir = join(import.meta.dir, "../../../agents");

  it("完整流程: 解析 → 注册处理器 → 派发 → 验证结果", async () => {
    const content = `---
name: e2e-test-agent
type: review
description: E2E 测试 Agent
input: 代码变更
output: 审查报告
tools: [read, grep, edit]
---
## 执行指令

1. 阅读代码变更
2. 分析潜在问题
3. 输出审查报告`;

    const def = parseAgentContent(content, "test.md");
    expect(def.name).toBe("e2e-test-agent");
    expect(def.type).toBe("review");
    expect(def.tools.length).toBe(3);

    const dispatcher = new AgentDispatcher();
    dispatcher.registerHandler("e2e-test-agent", async (ctx) => {
      return `Agent ${ctx.agent.name} 已完成审查，输入: ${ctx.input}`;
    });

    const result = await dispatcher.dispatch(def, {
      agent: def,
      input: "新增了 3 个文件",
    });

    expect(result.success).toBe(true);
    expect(result.agent).toBe("e2e-test-agent");
    expect(result.output).toContain("已完成审查");
    expect(result.output).toContain("新增了 3 个文件");
    expect(result.duration).toBeGreaterThanOrEqual(0);
  });

  it("真实 Agent 加载", () => {
    if (!existsSync(agentsDir)) {
      return;
    }

    const registry = loadAllAgents(agentsDir);
    expect(registry.size).toBeGreaterThan(0);

    const firstAgent = registry.values().next().value;
    expect(firstAgent).toBeDefined();
    expect(firstAgent!.name).toBeTruthy();
    expect(firstAgent!.instructions).toBeTruthy();
  });

  it("处理器不存在时派发失败", async () => {
    const content = `---
name: unknown-agent
type: other
description: 未知 Agent
---
## 指令

测试指令`;

    const def = parseAgentContent(content, "test.md");
    const dispatcher = new AgentDispatcher();
    const result = await dispatcher.dispatch(def, {
      agent: def,
      input: "测试输入",
    });

    expect(result.success).toBe(false);
    expect(result.output).toContain("未找到处理器");
  });

  it("处理器异常时派发失败", async () => {
    const content = `---
name: crash-agent
type: debug
description: 会崩溃的 Agent
---
## 指令

崩溃测试`;

    const def = parseAgentContent(content, "test.md");
    const dispatcher = new AgentDispatcher();
    dispatcher.registerHandler("crash-agent", async () => {
      throw new Error("Agent 内部错误");
    });

    const result = await dispatcher.dispatch(def, {
      agent: def,
      input: "触发崩溃",
    });

    expect(result.success).toBe(false);
    expect(result.output).toContain("Agent 内部错误");
  });

  it("批量派发多个 Agent", async () => {
    const agent1 = parseAgentContent(`---
name: agent-a
type: analysis
description: Agent A
---
## 指令
分析任务`, "a.md");

    const agent2 = parseAgentContent(`---
name: agent-b
type: doc
description: Agent B
---
## 指令
文档任务`, "b.md");

    const dispatcher = new AgentDispatcher();
    dispatcher.registerHandler("agent-a", async () => "Agent A 完成");
    dispatcher.registerHandler("agent-b", async () => "Agent B 完成");

    const results = await dispatcher.dispatchAll([agent1, agent2], {
      agent: agent1,
      input: "批量任务",
    });

    expect(results.length).toBe(2);
    expect(results[0]!.success).toBe(true);
    expect(results[0]!.output).toBe("Agent A 完成");
    expect(results[1]!.success).toBe(true);
    expect(results[1]!.output).toBe("Agent B 完成");
  });
});
