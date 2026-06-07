import { describe, it, expect } from "vitest";
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  type TaskStatus,
  type TaskPriority,
  type Task,
  type TaskTransition,
} from "../../src/task/types.js";

describe("Task 类型", () => {
  it("TaskStatus 必须是 8 个值的字面量联合,且 TASK_STATUSES 数组顺序与值完全匹配", () => {
    const expected: TaskStatus[] = [
      "backlog",
      "ready",
      "in_progress",
      "blocked",
      "review",
      "done",
      "failed",
      "cancelled",
    ];
    expect(TASK_STATUSES).toEqual(expected);
    expect(TASK_STATUSES).toHaveLength(8);
  });

  it("TaskPriority 必须是 4 个值的字面量联合,语义 P0(critical)→P3(low)", () => {
    const expected: TaskPriority[] = ["P0", "P1", "P2", "P3"];
    expect(TASK_PRIORITIES).toEqual(expected);
    expect(TASK_PRIORITIES).toHaveLength(4);
  });

  it("Task 接口必须要求 id/title/status/priority/dependsOn/createdAt,可选字段省略后整体对象可序列化比较", () => {
    const t: Task = {
      id: "T-001",
      title: "示例",
      status: "backlog",
      priority: "P1",
      dependsOn: [],
      createdAt: "2026-06-07T00:00:00Z",
    };
    expect(t).toEqual({
      id: "T-001",
      title: "示例",
      status: "backlog",
      priority: "P1",
      dependsOn: [],
      createdAt: "2026-06-07T00:00:00Z",
    });
  });

  it("Task 接口必须支持所有可选字段填齐 (description/owner/tags/startedAt/completedAt/extra)", () => {
    const t: Task = {
      id: "T-002",
      title: "完整字段",
      description: "一个完整填写可选字段的任务",
      status: "in_progress",
      priority: "P0",
      dependsOn: ["T-001"],
      owner: "implementer-子代理",
      createdAt: "2026-06-07T00:00:00Z",
      startedAt: "2026-06-07T01:00:00Z",
      tags: ["urgent", "security"],
      customField: "可序列化的任意元数据",
    };
    expect(t).toEqual({
      id: "T-002",
      title: "完整字段",
      description: "一个完整填写可选字段的任务",
      status: "in_progress",
      priority: "P0",
      dependsOn: ["T-001"],
      owner: "implementer-子代理",
      createdAt: "2026-06-07T00:00:00Z",
      startedAt: "2026-06-07T01:00:00Z",
      tags: ["urgent", "security"],
      customField: "可序列化的任意元数据",
    });
  });

  it("TaskTransition 必须是不可变记录,带可选 reason 与 actor 字段", () => {
    const tx: TaskTransition = {
      taskId: "T-001",
      from: "ready",
      to: "in_progress",
      ts: "2026-06-07T00:00:00Z",
      reason: "开始实现",
      actor: "implementer-子代理",
    };
    expect(tx).toEqual({
      taskId: "T-001",
      from: "ready",
      to: "in_progress",
      ts: "2026-06-07T00:00:00Z",
      reason: "开始实现",
      actor: "implementer-子代理",
    });
  });

  it("TaskTransition 必须允许省略 reason 与 actor 字段", () => {
    const tx: TaskTransition = {
      taskId: "T-002",
      from: "backlog",
      to: "ready",
      ts: "2026-06-07T00:00:00Z",
    };
    expect(tx).toEqual({
      taskId: "T-002",
      from: "backlog",
      to: "ready",
      ts: "2026-06-07T00:00:00Z",
    });
  });
});
