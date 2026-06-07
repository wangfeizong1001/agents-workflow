// 云枢 Task 子系统 —— TaskManager + Dashboard 的单元测试。
//
// 覆盖 YAML 持久化、合法/非法状态转移、跨实例恢复、文本仪表盘分桶;
// 配合 src/task/manager.ts 与 src/task/dashboard.ts 实现,作为阶段 2 任务 13 的 TDD 验证用例。

import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TaskManager } from "../../src/task/manager.js";
import { renderDashboard } from "../../src/task/dashboard.js";
import { YunShouError } from "../../src/shared/errors.js";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ys-tm-"));
});

describe("TaskManager", () => {
  it("create 必须生成 task 并追加到 tasks.yaml", () => {
    const tm = new TaskManager(join(dir, "tasks.yaml"));
    const t = tm.create({ id: "T1", title: "a", priority: "P1" });
    expect(t.status).toBe("backlog");
    expect(existsSync(join(dir, "tasks.yaml"))).toBe(true);
  });

  it("transition 合法转移必须改 status 并写时间戳", () => {
    const tm = new TaskManager(join(dir, "tasks.yaml"));
    tm.create({ id: "T1", title: "a", priority: "P1" });
    tm.transition("T1", "ready");
    const t = tm.list().find((x) => x.id === "T1")!;
    expect(t.status).toBe("ready");
  });

  it("transition 非法转移必须抛错", () => {
    const tm = new TaskManager(join(dir, "tasks.yaml"));
    tm.create({ id: "T1", title: "a", priority: "P1" });
    expect(() => tm.transition("T1", "done")).toThrow(YunShouError);
  });

  it("load 必须从已有 YAML 文件恢复任务", () => {
    const tm1 = new TaskManager(join(dir, "tasks.yaml"));
    tm1.create({ id: "T1", title: "a", priority: "P1" });
    tm1.transition("T1", "ready");
    const tm2 = new TaskManager(join(dir, "tasks.yaml"));
    const t = tm2.list().find((x) => x.id === "T1")!;
    expect(t.status).toBe("ready");
  });

  it("renderDashboard 必须按状态分桶输出", () => {
    const tm = new TaskManager(join(dir, "tasks.yaml"));
    tm.create({ id: "T1", title: "a", priority: "P1" });
    tm.create({ id: "T2", title: "b", priority: "P0" });
    tm.transition("T2", "ready");
    const out = renderDashboard(tm.list());
    expect(out).toMatch(/READY/);
    expect(out).toMatch(/T2/);
    expect(out).toMatch(/BACKLOG/);
  });

  // 关键契约补强: plan 13.1 给的 5 个测试全是快乐路径,以下分支需要锁定。

  it("create 重复 id 必须抛 YunShouError (UNKNOWN 兜底,见 plan 13.2 缺陷)", () => {
    const tm = new TaskManager(join(dir, "tasks.yaml"));
    tm.create({ id: "T1", title: "a", priority: "P1" });
    expect(() => tm.create({ id: "T1", title: "dup", priority: "P1" })).toThrow(
      YunShouError,
    );
  });

  it("transition 不存在的 id 必须抛 YunShouError", () => {
    const tm = new TaskManager(join(dir, "tasks.yaml"));
    expect(() => tm.transition("不存在的ID", "ready")).toThrow(YunShouError);
  });

  it("transition 到 in_progress 必须自动写 startedAt 时间戳", () => {
    const tm = new TaskManager(join(dir, "tasks.yaml"));
    tm.create({ id: "T1", title: "a", priority: "P1" });
    tm.transition("T1", "ready");
    const updated = tm.transition("T1", "in_progress");
    expect(updated.startedAt).toBeDefined();
    // ISO 8601 格式粗校验: 长度 24 字符 + 'T' + 'Z'
    expect(updated.startedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it("transition 到 done 必须自动写 completedAt 时间戳", () => {
    const tm = new TaskManager(join(dir, "tasks.yaml"));
    tm.create({ id: "T1", title: "a", priority: "P1" });
    tm.transition("T1", "ready");
    tm.transition("T1", "in_progress");
    const updated = tm.transition("T1", "review");
    const done = tm.transition("T1", "done");
    expect(done.completedAt).toBeDefined();
    expect(done.completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    // 验证 done 不会清掉 startedAt
    expect(done.startedAt).toBe(updated.startedAt);
  });

  it("renderDashboard 空任务列表必须仅输出标题", () => {
    const out = renderDashboard([]);
    expect(out).toBe("# 任务仪表盘\n");
  });
});
