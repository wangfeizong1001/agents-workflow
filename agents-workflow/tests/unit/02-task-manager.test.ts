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
});
