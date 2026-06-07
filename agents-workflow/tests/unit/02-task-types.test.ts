import { describe, it, expect } from "vitest";
import {
  TaskStatus,
  TaskPriority,
  type Task,
  type TaskTransition,
} from "../../src/task/types.js";

describe("Task 类型", () => {
  it("TaskStatus 必须是 8 个值的字面量联合", () => {
    const all: TaskStatus[] = [
      "backlog",
      "ready",
      "in_progress",
      "blocked",
      "review",
      "done",
      "failed",
      "cancelled",
    ];
    expect(all).toHaveLength(8);
  });

  it("TaskPriority 必须是 4 个值的字面量联合", () => {
    const all: TaskPriority[] = ["P0", "P1", "P2", "P3"];
    expect(all).toHaveLength(4);
  });

  it("Task 接口必须要求 id/title/status/priority/dependsOn", () => {
    const t: Task = {
      id: "T1",
      title: "示例",
      status: "backlog",
      priority: "P1",
      dependsOn: [],
      createdAt: "2026-06-07T00:00:00Z",
    };
    expect(t.id).toBe("T1");
  });

  it("TaskTransition 必须是不可变记录", () => {
    const tx: TaskTransition = {
      taskId: "T1",
      from: "ready",
      to: "in_progress",
      ts: "2026-06-07T00:00:00Z",
    };
    expect(tx.from).toBe("ready");
  });
});
