import { describe, it, expect, vi } from "vitest";

// Mock execSync before importing AutoDriver
vi.mock("node:child_process", () => ({
  execSync: vi.fn().mockReturnValue("所有任务已完成"),
}));

// Dynamic import to ensure mock is in place
async function getAutoDriver(): Promise<typeof import("../../src/auto-driver/index.js")> {
  return import("../../src/auto-driver/index.js");
}

describe("AutoDriver", () => {
  it("构造函数接受配置", async () => {
    const { AutoDriver } = await getAutoDriver();
    const d = new AutoDriver({ cwd: "/tmp", planId: "p1", injectPrompt: async () => "ok" });
    expect(d).toBeInstanceOf(AutoDriver);
  });

  it("drive 执行完成后返回", async () => {
    const { AutoDriver } = await getAutoDriver();
    const d = new AutoDriver({ cwd: "/tmp", planId: "p1", injectPrompt: async () => "ok" });
    const result = await d.drive();
    expect(result).toHaveProperty("completedTasks");
    expect(typeof result.completedTasks).toBe("number");
  });
});
