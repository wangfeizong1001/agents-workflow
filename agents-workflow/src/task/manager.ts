// 云枢 Task 子系统 —— YAML 持久化的 TaskManager 与文本仪表盘。
//
// TaskManager: 封装 tasks.yaml 的读写,提供 list/create/transition 三个公共方法。
//   - create 生成 backlog 状态任务,id 重复抛 YunShouError(plan 13.2 用 UNKNOWN 兜底)
//   - transition 用 state-machine.canTransition 守卫,非法转移抛 STATE_INVALID_TRANSITION
//   - transition 自动维护 startedAt(in_progress) / completedAt(done) 时间戳
//   - 每次操作重读全量 YAML,简单可靠;100+ 任务规模可改增量缓存
//   - reason 参数当前是 placeholder,未持久化(plan 13.2 缺陷,见 commit 信息)
//
// renderDashboard: 按 8 态 BUCKETS 顺序遍历,空桶跳过,输出 Markdown 文本。
//
// 持久化格式: { tasks: Task[] } (单层 YAML 容器)
// 原子写入: writeFileAtomic (阶段 1 任务 7) 保证崩溃一致性

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
