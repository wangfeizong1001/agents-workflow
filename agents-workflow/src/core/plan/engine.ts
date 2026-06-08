// 云枢 Plan 子系统 —— 计划引擎核心 (阶段 7 任务 22)。
//
// 模块职责:
//   - create(input): 渲染 plan.md.tmpl 写入 .yunshou/plans/{id}.md,
//     同时将 splitPlan 结果写入 {id}.tasks.yaml, 追加 plan.created 事件。
//   - tasks(planId): 从 YAML 反序列化任务列表。
//   - nextTask(planId): 返回第一个 pending 且依赖全部 done 的任务。
//   - markTask(planId, taskId, status): 更新任务状态并写回 YAML。
//   - advance(planId, to): 读取 frontmatter, 改写 status 字段。
//
// 接口契约:
//   - create 的 markdown 参数是原始 Markdown(含 ## 任务标题), 不做转义。
//   - tasks 返回空数组而非 undefined (planId 不存在时)。
//   - nextTask 返回 undefined 表示无可用任务(全部 done 或全部 blocked)。

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ensureDir, writeFileAtomic, readText } from "../../shared/fs-helpers.js";
import { splitFrontmatter, readYaml, writeYaml } from "../../shared/yaml.js";
import { splitPlan } from "./splitter.js";
import { renderPlanTemplate, type PlanTemplateInput } from "./template.js";
import type { StateStore } from "../state/store.js";
import type { PlanTask, PlanTaskStatus } from "./types.js";

export interface PlanEngineOptions {
  readonly root: string;
  readonly store: StateStore;
}

export interface CreatePlanInput {
  readonly id: string;
  readonly title: string;
  readonly specId: string;
  readonly markdown: string;
}

export class PlanEngine {
  private readonly plansDir: string;

  constructor(private readonly opts: PlanEngineOptions) {
    this.plansDir = join(opts.root, ".yunshou", "plans");
    ensureDir(this.plansDir);
  }

  public create(input: CreatePlanInput): string {
    const tmpl: PlanTemplateInput = {
      id: input.id,
      title: input.title,
      specId: input.specId,
      date: new Date().toISOString().slice(0, 10),
      body: input.markdown,
    };
    const md = renderPlanTemplate(tmpl);
    writeFileAtomic(join(this.plansDir, `${input.id}.md`), md);
    writeFileAtomic(
      join(this.plansDir, `${input.id}.tasks.yaml`),
      writeYaml({ tasks: splitPlan(input.markdown, input.id) }),
    );
    this.opts.store.append({ type: "plan.created", planId: input.id } as const);
    return input.id;
  }

  public tasks(planId: string): PlanTask[] {
    const path = join(this.plansDir, `${planId}.tasks.yaml`);
    if (!existsSync(path)) return [];
    const raw = readText(path);
    const data = readYaml<{ tasks: PlanTask[] }>(raw);
    return data.tasks;
  }

  public nextTask(planId: string): PlanTask | undefined {
    const tasks = this.tasks(planId);
    const done = new Set(tasks.filter((t) => t.status === "done").map((t) => t.id));
    return tasks.find(
      (t) => t.status === "pending" && t.dependsOn.every((d) => done.has(d)),
    );
  }

  public markTask(planId: string, taskId: string, status: PlanTaskStatus): void {
    const tasks = this.tasks(planId);
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
    writeFileAtomic(
      join(this.plansDir, `${planId}.tasks.yaml`),
      writeYaml({ tasks: updated }),
    );
    this.opts.store.append({ type: "plan.task.started", planId, taskId } as const);
  }

  public advance(planId: string, to: "approved" | "in_progress" | "completed"): void {
    const path = join(this.plansDir, `${planId}.md`);
    const raw = readText(path);
    const { meta, body } = splitFrontmatter(raw);
    const fm = readYaml<Record<string, string>>(meta || "{}");
    const next = { ...fm, status: to };
    writeFileAtomic(path, `---\n${writeYaml(next).trim()}\n---\n${body}`);
    this.opts.store.append({ type: "plan.phase.changed", planId, data: { to } } as const);
  }
}
