import type { AgentDef, AgentContext, AgentResult, AgentRegistry } from "./types.js";

/** Agent 派发器 - 将 Agent 定义转化为可执行任务 */
export class AgentDispatcher {
  private readonly handlers = new Map<string, (ctx: AgentContext) => Promise<string>>();

  /** 注册 Agent 处理器 */
  public registerHandler(
    agentName: string,
    handler: (ctx: AgentContext) => Promise<string>,
  ): void {
    this.handlers.set(agentName, handler);
  }

  /** 派发单个 Agent */
  public async dispatch(agent: AgentDef, ctx: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    const handler = this.handlers.get(agent.name);

    if (!handler) {
      return {
        agent: agent.name,
        success: false,
        output: `未找到处理器: ${agent.name}`,
        duration: Date.now() - startTime,
      };
    }

    try {
      const output = await handler(ctx);
      return {
        agent: agent.name,
        success: true,
        output,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        agent: agent.name,
        success: false,
        output: message,
        duration: Date.now() - startTime,
      };
    }
  }

  /** 批量派发多个 Agent */
  public async dispatchAll(
    agents: ReadonlyArray<AgentDef>,
    ctx: AgentContext,
  ): Promise<ReadonlyArray<AgentResult>> {
    const results: AgentResult[] = [];
    for (const agent of agents) {
      const result = await this.dispatch(agent, ctx);
      results.push(result);
    }
    return results;
  }
}

/** 创建默认派发器（带内置处理器） */
export function createDefaultDispatcher(): AgentDispatcher {
  const dispatcher = new AgentDispatcher();

  dispatcher.registerHandler("code-reviewer", async () => "代码审查完成");
  dispatcher.registerHandler("debugger", async () => "调试完成");
  dispatcher.registerHandler("planner", async () => "规划完成");
  dispatcher.registerHandler("doc-writer", async () => "文档编写完成");
  dispatcher.registerHandler("verifier", async () => "验证完成");

  return dispatcher;
}
