// 云枢 Task 子系统 —— TaskManager 实现。
//
// 提供基于 YAML 的任务持久化(create/list/transition),
// 依赖 ./state-machine.canTransition 做合法性校验,非法转移抛 YunShouError。

import { writeFileAtomic, readText, fileExists } from "../shared/fs-helpers.js";
import { readYaml, writeYaml } from "../shared/yaml.js";
import { YunShouError, YSErrorCode } from "../shared/errors.js";
import { canTransition } from "./state-machine.js";
import type { Task, TaskStatus, TaskPriority } from "./types.js";

interface CreateInput {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly priority: TaskPriority;
  readonly dependsOn?: readonly string[];
  readonly owner?: string;
  readonly tags?: readonly string[];
}

export class TaskManager {
  constructor(private readonly file: string) {}

  public list(): Task[] {
    if (!fileExists(this.file)) return [];
    const data = readYaml<{ tasks?: Task[] }>(readText(this.file));
    return data.tasks ?? [];
  }

  public create(input: CreateInput): Task {
    const tasks = this.list();
    if (tasks.some((t) => t.id === input.id)) {
      throw new YunShouError("任务 id 已存在", YSErrorCode.UNKNOWN, { id: input.id });
    }
    const task: Task = {
      id: input.id,
      title: input.title,
      ...(input.description !== undefined ? { description: input.description } : {}),
      status: "backlog",
      priority: input.priority,
      dependsOn: input.dependsOn ?? [],
      ...(input.owner !== undefined ? { owner: input.owner } : {}),
      createdAt: new Date().toISOString(),
      ...(input.tags !== undefined ? { tags: input.tags } : {}),
    };
    this.save([...tasks, task]);
    return task;
  }

  public transition(id: string, to: TaskStatus, reason?: string): Task {
    const tasks = this.list();
    const t = tasks.find((x) => x.id === id);
    if (!t) throw new YunShouError("任务不存在", YSErrorCode.UNKNOWN, { id });
    if (!canTransition(t.status, to)) {
      throw new YunShouError(
        "非法状态转移",
        YSErrorCode.STATE_INVALID_TRANSITION,
        { from: t.status, to, id },
      );
    }
    const updated: Task = {
      ...t,
      status: to,
      ...(to === "in_progress" ? { startedAt: new Date().toISOString() } : {}),
      ...(to === "done" ? { completedAt: new Date().toISOString() } : {}),
    };
    this.save(tasks.map((x) => (x.id === id ? updated : x)));
    if (reason !== undefined) {
      void reason;
    }
    return updated;
  }

  private save(tasks: readonly Task[]): void {
    writeFileAtomic(this.file, writeYaml({ tasks }));
  }
}
