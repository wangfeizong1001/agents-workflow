import type { WorkflowDef, WorkflowResult, StepResult } from "./types.js";

/** 工作流执行器 */
export class WorkflowExecutor {
  private readonly handlers = new Map<string, (args: readonly string[]) => Promise<string>>();

  /** 注册步骤处理器 */
  public registerHandler(
    command: string,
    handler: (args: readonly string[]) => Promise<string>,
  ): void {
    this.handlers.set(command, handler);
  }

  /** 执行工作流 */
  public async execute(workflow: WorkflowDef): Promise<WorkflowResult> {
    const startTime = Date.now();
    const stepResults: StepResult[] = [];
    let allSuccess = true;

    for (const step of workflow.steps) {
      const stepStart = Date.now();
      const handler = this.handlers.get(step.command);

      if (!handler) {
        stepResults.push({
          stepId: step.id,
          success: false,
          output: `未找到处理器: ${step.command}`,
          duration: Date.now() - stepStart,
        });
        allSuccess = false;
        continue;
      }

      try {
        const output = await handler(step.args);
        stepResults.push({
          stepId: step.id,
          success: true,
          output,
          duration: Date.now() - stepStart,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        stepResults.push({
          stepId: step.id,
          success: false,
          output: message,
          duration: Date.now() - stepStart,
        });
        allSuccess = false;
      }
    }

    return {
      workflow: workflow.name,
      success: allSuccess,
      steps: stepResults,
      duration: Date.now() - startTime,
    };
  }
}

/** 创建默认执行器（带内置处理器） */
export function createDefaultExecutor(): WorkflowExecutor {
  const executor = new WorkflowExecutor();

  executor.registerHandler("health", async () => "健康检查完成");
  executor.registerHandler("diagnose-issues", async () => "问题分析完成");
  executor.registerHandler("session-report", async () => "报告已生成");
  executor.registerHandler("code-review", async () => "代码评审完成");
  executor.registerHandler("debug", async () => "调试完成");
  executor.registerHandler("qa", async () => "测试完成");
  executor.registerHandler("ship", async () => "部署完成");
  executor.registerHandler("explore", async () => "探索完成");

  return executor;
}
