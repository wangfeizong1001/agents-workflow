import { describe, it, expect } from "vitest";
import { topologicalSort, detectCycle, readyTasks } from "../../src/task/dependency.js";
import { YSErrorCode, YunShouError } from "../../src/shared/errors.js";
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

  // 关键边界补强: 空数组 / 单节点 / 自循环 / 不存在依赖 ID / 错误码强断言。
  // plan 12.1 给的 5 个测试仅覆盖快乐路径与 1 个错误路径,任务 13 接入时
  // 这些边界会被反复踩到,故提前锁定契约。

  it("空 tasks 数组必须返回空 (topologicalSort / detectCycle / readyTasks)", () => {
    expect(topologicalSort([])).toEqual([]);
    expect(detectCycle([])).toEqual([]);
    expect(readyTasks([])).toEqual([]);
  });

  it("单节点无依赖: topologicalSort 返回该节点, readyTasks 按状态过滤", () => {
    const tasks = [mk("A", "ready")];
    expect(topologicalSort(tasks).map((t) => t.id)).toEqual(["A"]);
    expect(readyTasks(tasks).map((t) => t.id)).toEqual(["A"]);
  });

  it("自循环 A→A: detectCycle 返 ['A','A'], topologicalSort 抛 PLAN_DAG_CYCLE 且 code 强断言", () => {
    const tasks = [mk("A", "ready", ["A"])];
    expect(detectCycle(tasks)).toEqual(["A", "A"]);
    let caught: unknown = null;
    try {
      topologicalSort(tasks);
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(YunShouError);
    // 自 unknown 收窄到 YunShouError 是必要 narrowing,非反模式
    expect((caught as YunShouError).code).toBe(YSErrorCode.PLAN_DAG_CYCLE);
  });

  it("dependsOn 指向不存在的 ID: 静默过滤,排序仍可完成", () => {
    const tasks = [mk("A", "ready", ["不存在的ID"])];
    expect(topologicalSort(tasks).map((t) => t.id)).toEqual(["A"]);
  });

  it("拓扑排序遇环抛 PLAN_DAG_CYCLE: error.code 强断言 (为任务 13 TaskManager 锁定契约)", () => {
    const tasks = [mk("A", "ready", ["B"]), mk("B", "ready", ["A"])];
    let caught: unknown = null;
    try {
      topologicalSort(tasks);
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(YunShouError);
    expect((caught as YunShouError).code).toBe(YSErrorCode.PLAN_DAG_CYCLE);
  });
});
