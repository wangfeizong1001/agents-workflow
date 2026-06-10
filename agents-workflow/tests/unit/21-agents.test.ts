import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  parseAgentContent,
  scanAgents,
  loadAllAgents,
  AgentDispatcher,
} from "../../src/agents/index.js";

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ys-agents-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

const SAMPLE_AGENT = `---
name: code-reviewer
type: review
input: 代码变更（diff 或文件列表）
output: 结构化审查报告（REVIEW.md）
tools: [Read, Grep, Glob, Bash]
---

## code-reviewer

### 职责
审查代码变更，识别 bug、安全漏洞、质量问题和设计缺陷。

### 工作流程
1. 分析代码变更范围和目的
2. 逐文件审查代码质量
3. 识别潜在问题
`;

describe("Agent 引擎", () => {
  it("parseAgentContent 应解析 frontmatter", () => {
    const def = parseAgentContent(SAMPLE_AGENT, "/test.md");
    expect(def.name).toBe("code-reviewer");
    expect(def.type).toBe("review");
    expect(def.input).toBe("代码变更（diff 或文件列表）");
    expect(def.output).toBe("结构化审查报告（REVIEW.md）");
    expect(def.tools).toEqual(["Read", "Grep", "Glob", "Bash"]);
  });

  it("parseAgentContent 应提取指令", () => {
    const def = parseAgentContent(SAMPLE_AGENT, "/test.md");
    expect(def.instructions).toContain("## code-reviewer");
    expect(def.instructions).toContain("### 职责");
  });

  it("parseAgentContent 应推断 Agent 类型", () => {
    const types = ["independent", "analysis", "review", "planning", "doc", "debug", "ui", "integration"];
    for (const type of types) {
      const content = `---\nname: test-${type}\ntype: ${type}\n---\n## test`;
      const def = parseAgentContent(content, "/test.md");
      expect(def.type).toBe(type);
    }
  });

  it("scanAgents 应扫描目录下所有 Agent", () => {
    writeFileSync(join(dir, "code-reviewer.md"), SAMPLE_AGENT, "utf-8");
    writeFileSync(
      join(dir, "debugger.md"),
      `---\nname: debugger\ntype: debug\n---\n## debugger\n调试问题`,
      "utf-8",
    );

    const agents = scanAgents(dir);
    expect(agents).toHaveLength(2);
    expect(agents.map((a) => a.name).sort()).toEqual(["code-reviewer", "debugger"]);
  });

  it("loadAllAgents 应返回注册表", () => {
    writeFileSync(join(dir, "code-reviewer.md"), SAMPLE_AGENT, "utf-8");

    const registry = loadAllAgents(dir);
    expect(registry.size).toBe(1);
    expect(registry.has("code-reviewer")).toBe(true);
  });

  it("AgentDispatcher 应派发已注册的处理器", async () => {
    const dispatcher = new AgentDispatcher();
    dispatcher.registerHandler("code-reviewer", async () => "审查完成");

    const def = parseAgentContent(SAMPLE_AGENT, "/test.md");
    const result = await dispatcher.dispatch(def, {
      cwd: "/tmp",
      args: [],
      env: new Map(),
    });

    expect(result.success).toBe(true);
    expect(result.output).toBe("审查完成");
    expect(result.agent).toBe("code-reviewer");
  });

  it("AgentDispatcher 应处理未注册的处理器", async () => {
    const dispatcher = new AgentDispatcher();
    const def = parseAgentContent(SAMPLE_AGENT, "/test.md");
    const result = await dispatcher.dispatch(def, {
      cwd: "/tmp",
      args: [],
      env: new Map(),
    });

    expect(result.success).toBe(false);
    expect(result.output).toContain("未找到处理器");
  });

  it("AgentDispatcher 应处理执行错误", async () => {
    const dispatcher = new AgentDispatcher();
    dispatcher.registerHandler("code-reviewer", async () => {
      throw new Error("执行失败");
    });

    const def = parseAgentContent(SAMPLE_AGENT, "/test.md");
    const result = await dispatcher.dispatch(def, {
      cwd: "/tmp",
      args: [],
      env: new Map(),
    });

    expect(result.success).toBe(false);
    expect(result.output).toBe("执行失败");
  });
});
