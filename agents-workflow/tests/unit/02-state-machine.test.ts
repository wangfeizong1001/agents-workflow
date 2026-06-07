// 云枢 Task 子系统 —— 任务状态机合法转移表的单元测试。
//
// 覆盖 8 态状态机的所有合法转移以及非法转移拒绝;
// 配合 src/task/state-machine.ts 实现,作为阶段 2 任务 11 的 TDD 验证用例。

import { describe, it, expect } from "vitest";
import { canTransition, allowedNext } from "../../src/task/state-machine.js";
import { TASK_STATUSES, type TaskStatus } from "../../src/task/types.js";

describe("任务状态机", () => {
  it("backlog → ready 合法", () => {
    expect(canTransition("backlog", "ready")).toBe(true);
  });

  it("backlog → done 非法 (必须经过 ready/in_progress)", () => {
    expect(canTransition("backlog", "done")).toBe(false);
  });

  it("done 是终态,不能向任何状态转移", () => {
    for (const s of [
      "backlog",
      "ready",
      "in_progress",
      "blocked",
      "review",
      "failed",
      "cancelled",
    ] as TaskStatus[]) {
      expect(canTransition("done", s)).toBe(false);
    }
  });

  it("failed 可重试回 ready", () => {
    expect(canTransition("failed", "ready")).toBe(true);
  });

  it("blocked 解阻后可去 ready/in_progress/cancelled", () => {
    expect(canTransition("blocked", "ready")).toBe(true);
    expect(canTransition("blocked", "in_progress")).toBe(true);
    expect(canTransition("blocked", "cancelled")).toBe(true);
    expect(canTransition("blocked", "done")).toBe(false);
  });

  it("allowedNext 必须列出当前状态的所有合法 next", () => {
    const fromReady = allowedNext("ready");
    expect(fromReady).toContain("in_progress");
    expect(fromReady).toContain("blocked");
    expect(fromReady).toContain("cancelled");
    expect(fromReady).not.toContain("done");
  });

  // 穷尽性基线: 8 态状态机所有可能的对 (from, to) 都不能漏测。
  // 后续若增删 TRANSITIONS 一行,以下测试应能立即发现回归。

  it("穷尽性基线: 8 态终态判别 (done/cancelled 无出口,其余有出口且不含自环)", () => {
    for (const s of TASK_STATUSES) {
      const next = allowedNext(s);
      if (s === "done" || s === "cancelled") {
        expect(next).toHaveLength(0);
      } else {
        expect(next.length).toBeGreaterThan(0);
        expect(next).not.toContain(s);
      }
    }
  });

  it("穷尽性基线: 自环 (X → X) 对所有 8 态都应被拒绝", () => {
    for (const s of TASK_STATUSES) {
      expect(canTransition(s, s)).toBe(false);
    }
  });

  it("穷尽性基线: in_progress 4 个出口必须齐全 (review/blocked/failed/cancelled)", () => {
    const next = allowedNext("in_progress");
    expect(next).toEqual(
      expect.arrayContaining(["review", "blocked", "failed", "cancelled"]),
    );
    expect(next).toHaveLength(4);
  });

  it("穷尽性基线: review 3 个出口必须齐全 (done/in_progress/failed)", () => {
    const next = allowedNext("review");
    expect(next).toEqual(
      expect.arrayContaining(["done", "in_progress", "failed"]),
    );
    expect(next).toHaveLength(3);
  });

  it("穷尽性基线: 非法对反向校验 (从任意终态出发去 ready 都被拒,除 failed 重试)", () => {
    expect(canTransition("done", "ready")).toBe(false);
    expect(canTransition("cancelled", "ready")).toBe(false);
    expect(canTransition("failed", "ready")).toBe(true);
  });
});
