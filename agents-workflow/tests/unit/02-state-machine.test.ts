// 云枢 Task 子系统 —— 任务状态机合法转移表的单元测试。
//
// 覆盖 8 态状态机的所有合法转移以及非法转移拒绝;
// 配合 src/task/state-machine.ts 实现,作为阶段 2 任务 11 的 TDD 验证用例。

import { describe, it, expect } from "vitest";
import { canTransition, allowedNext } from "../../src/task/state-machine.js";
import type { TaskStatus } from "../../src/task/types.js";

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
});
