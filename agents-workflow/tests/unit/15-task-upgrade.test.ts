import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TaskManager } from "../../src/task/manager.js";
import type { Task } from "../../src/task/types.js";

let dir: string;
let file: string;
let mgr: TaskManager;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ys-task-up-"));
  file = join(dir, "tasks.yaml");
  mgr = new TaskManager(file);
  mgr.create({ id: "T1", title: "test", priority: "P1" });
});

describe("Task 字段升级", () => {
  it("updateTask 可以更新 assignee", () => {
    mgr.updateTask("T1", { assignee: "wangfei" });
    const t = mgr.list().find((x) => x.id === "T1")!;
    expect(t.assignee).toBe("wangfei");
  });

  it("updateTask 可以更新 blocks", () => {
    mgr.updateTask("T1", { blocks: ["T2", "T3"] });
    const t = mgr.list().find((x) => x.id === "T1")!;
    expect(t.blocks).toEqual(["T2", "T3"]);
  });

  it("updateTask 可以更新 parentId 和 subtaskIds", () => {
    mgr.updateTask("T1", { parentId: "P0", subtaskIds: ["T1a", "T1b"] });
    const t = mgr.list().find((x) => x.id === "T1")!;
    expect(t.parentId).toBe("P0");
    expect(t.subtaskIds).toEqual(["T1a", "T1b"]);
  });

  it("updateTask 可以更新 estimateMin 和 actualMin", () => {
    mgr.updateTask("T1", { estimateMin: 30, actualMin: 45 });
    const t = mgr.list().find((x) => x.id === "T1")!;
    expect(t.estimateMin).toBe(30);
    expect(t.actualMin).toBe(45);
  });

  it("updateTask 可以更新 due", () => {
    mgr.updateTask("T1", { due: "2026-06-15" });
    const t = mgr.list().find((x) => x.id === "T1")!;
    expect(t.due).toBe("2026-06-15");
  });

  it("updateTask 抛出错误当任务不存在", () => {
    expect(() => mgr.updateTask("NONEXIST", { assignee: "x" })).toThrow("任务不存在");
  });

  it("updateTask 不改变 id 和 createdAt", () => {
    const before = mgr.list().find((x) => x.id === "T1")!;
    mgr.updateTask("T1", { assignee: "x", title: "updated" });
    const after = mgr.list().find((x) => x.id === "T1")!;
    expect(after.id).toBe("T1");
    expect(after.createdAt).toBe(before.createdAt);
  });

  it("老记录无新字段不报错（向后兼容）", () => {
    const t = mgr.list().find((x) => x.id === "T1")!;
    expect(t.assignee).toBeUndefined();
    expect(t.blocks).toBeUndefined();
    expect(t.parentId).toBeUndefined();
    expect(t.estimateMin).toBeUndefined();
    expect(t.due).toBeUndefined();
  });
});
