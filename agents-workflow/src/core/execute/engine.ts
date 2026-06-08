// 云枢 Execute 子系统 —— 执行引擎核心 (阶段 8 任务 24)。
//
// 模块职责:
//   - nextPrompt(planId): 从 PlanEngine 获取下一个可执行任务,
//     生成提示词文件到 .yunshou/prompts/{taskId}.md。
//   - completeTask(planId, taskId): 标记任务 done + 追加事件。
//
// 接口契约:
//   - nextPrompt 返回 undefined 表示计划全部完成。
//   - completeTask 的 taskId 为空时抛 CLI_INVALID_ARGS。

import { join } from "node:path";
import { writeFileAtomic, ensureDir } from "../../shared/fs-helpers.js";
import { PlanEngine } from "../plan/engine.js";
import type { StateStore } from "../state/store.js";
import { renderPrompt } from "./prompt.js";
import type { PromptOutput } from "./types.js";
import { YunShouError, YSErrorCode } from "../../shared/errors.js";

export interface ExecuteEngineOptions {
  readonly root: string;
  readonly store: StateStore;
}

export class ExecuteEngine {
  constructor(private readonly opts: ExecuteEngineOptions) {}

  public nextPrompt(planId: string): PromptOutput | undefined {
    const plan = new PlanEngine({ root: this.opts.root, store: this.opts.store });
    const task = plan.nextTask(planId);
    if (!task) return undefined;
    const promptDir = join(this.opts.root, ".yunshou", "prompts");
    ensureDir(promptDir);
    const promptFile = join(promptDir, `${task.id}.md`);
    const prompt = renderPrompt(task, planId, "");
    writeFileAtomic(promptFile, prompt);
    this.opts.store.append({ type: "execute.prompt.generated", planId, taskId: task.id } as const);
    return { taskId: task.id, planId, prompt, promptFile };
  }

  public completeTask(planId: string, taskId: string): void {
    if (!taskId) {
      throw new YunShouError("缺少 taskId", YSErrorCode.CLI_INVALID_ARGS, { planId });
    }
    const plan = new PlanEngine({ root: this.opts.root, store: this.opts.store });
    plan.markTask(planId, taskId, "done");
    this.opts.store.append({ type: "execute.task.completed", planId, taskId } as const);
  }
}
