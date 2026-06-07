import { describe, it, expect } from "vitest";
import { topologicalSort, detectCycle, readyTasks } from "../../src/task/dependency.js";
import { YunShouError } from "../../src/shared/errors.js";
import type { Task } from "../../src/task/types.js";

const mk = (id: string, status: Task["status"], deps: string[] = []): Task => ({
  id,
  title: id,
  status,
  priority: "P1",
  dependsOn: deps,
  createdAt: "2026-06-07T00:00:00Z",
});

describe("任务依赖分析", () => {
  it("topologicalSort 必须按依赖顺序返回", () => {
    const tasks = [mk("C", "ready", ["B"]), mk("B", "ready", ["A"]), mk("A", "ready")];
    const sorted = topologicalSort(tasks);
    expect(sorted.map((t) => t.id)).toEqual(["A", "B", "C"]);
  });

  it("detectCycle 必须在环存在时返回环路径", () => {
    const tasks = [mk("A", "ready", ["C"]), mk("B", "ready", ["A"]), mk("C", "ready", ["B"])];
    const cycle = detectCycle(tasks);
    expect(cycle).toEqual(["A", "C", "B", "A"]);
  });

  it("detectCycle 无环时返回空数组", () => {
    const tasks = [mk("A", "ready"), mk("B", "ready", ["A"])];
    expect(detectCycle(tasks)).toEqual([]);
  });

  it("readyTasks 必须返回 status=ready 且依赖全部 done 的任务", () => {
    const tasks = [
      mk("A", "done"),
      mk("B", "ready", ["A"]),
      mk("C", "ready", ["A", "B"]),
      mk("D", "in_progress", ["A"]),
    ];
    const ready = readyTasks(tasks);
    expect(ready.map((t) => t.id)).toEqual(["B"]);
  });

  it("拓扑排序遇到环时必须抛 PLAN_DAG_CYCLE", () => {
    const tasks = [mk("A", "ready", ["B"]), mk("B", "ready", ["A"])];
    expect(() => topologicalSort(tasks)).toThrow(YunShouError);
  });
});
