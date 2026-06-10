import { describe, it, expect } from "vitest";
import { SyncEngine } from "../../src/relay/sync-engine.js";
import { ConflictResolver } from "../../src/relay/conflict-resolver.js";
import type { SyncEvent } from "../../src/relay/types.js";

describe("协作同步", () => {
  describe("SyncEngine", () => {
    it("应支持客户端加入和离开", () => {
      const engine = new SyncEngine();
      const state = engine.join("client-1");

      expect(state.clientId).toBe("client-1");
      expect(engine.clientCount()).toBe(1);

      engine.leave("client-1");
      expect(engine.clientCount()).toBe(0);
    });

    it("应接收并存储事件", () => {
      const engine = new SyncEngine();
      engine.join("client-1");

      const event = engine.receive({
        type: "task.update",
        data: { taskId: "t-1", status: "done" },
        clientId: "client-1",
        timestamp: Date.now(),
      });

      expect(event.id).toBeDefined();
      expect(event.version).toBe(0);
      expect(engine.getEvents()).toHaveLength(1);
    });

    it("应触发同步回调", () => {
      const engine = new SyncEngine();
      const received: SyncEvent[] = [];
      engine.onSync((e) => received.push(e));

      engine.receive({
        type: "task.create",
        data: { title: "新任务" },
        clientId: "client-1",
        timestamp: Date.now(),
      });

      expect(received).toHaveLength(1);
      expect(received[0]?.type).toBe("task.create");
    });

    it("应检测冲突事件", () => {
      const engine = new SyncEngine();
      const now = Date.now();

      engine.receive({
        type: "task.update",
        data: { taskId: "t-1", status: "done" },
        clientId: "client-1",
        timestamp: now,
      });

      const event2 = engine.receive({
        type: "task.update",
        data: { taskId: "t-1", status: "cancelled" },
        clientId: "client-2",
        timestamp: now + 100,
      });

      expect(event2.version).toBe(1);
    });
  });

  describe("ConflictResolver", () => {
    it("最后写入者胜出", () => {
      const resolver = new ConflictResolver();
      resolver.setStrategy("last-write-wins");

      const conflict = {
        eventId: "e-1",
        clientA: "c-1",
        clientB: "c-2",
        eventA: {
          id: "e-a",
          type: "task.update",
          data: { status: "done" },
          clientId: "c-1",
          timestamp: 1000,
          version: 0,
        },
        eventB: {
          id: "e-b",
          type: "task.update",
          data: { status: "cancelled" },
          clientId: "c-2",
          timestamp: 2000,
          version: 1,
        },
      };

      const resolved = resolver.resolve(conflict);
      expect(resolved.id).toBe("e-b");
      expect((resolved.data as Record<string, string>).status).toBe("cancelled");
    });

    it("合并解决", () => {
      const resolver = new ConflictResolver();
      resolver.setStrategy("merge");

      const conflict = {
        eventId: "e-1",
        clientA: "c-1",
        clientB: "c-2",
        eventA: {
          id: "e-a",
          type: "task.update",
          data: { title: "任务A" },
          clientId: "c-1",
          timestamp: 1000,
          version: 0,
        },
        eventB: {
          id: "e-b",
          type: "task.update",
          data: { status: "done" },
          clientId: "c-2",
          timestamp: 2000,
          version: 1,
        },
      };

      const resolved = resolver.resolve(conflict);
      expect((resolved.data as Record<string, string>).title).toBe("任务A");
      expect((resolved.data as Record<string, string>).status).toBe("done");
    });

    it("批量解决冲突", () => {
      const resolver = new ConflictResolver();
      resolver.setStrategy("last-write-wins");

      const conflicts = [
        {
          eventId: "e-1",
          clientA: "c-1",
          clientB: "c-2",
          eventA: { id: "e-a", type: "update", data: {}, clientId: "c-1", timestamp: 1000, version: 0 },
          eventB: { id: "e-b", type: "update", data: {}, clientId: "c-2", timestamp: 2000, version: 1 },
        },
        {
          eventId: "e-2",
          clientA: "c-1",
          clientB: "c-2",
          eventA: { id: "e-c", type: "update", data: {}, clientId: "c-1", timestamp: 3000, version: 2 },
          eventB: { id: "e-d", type: "update", data: {}, clientId: "c-2", timestamp: 4000, version: 3 },
        },
      ];

      const resolved = resolver.resolveAll(conflicts);
      expect(resolved).toHaveLength(2);
    });
  });
});
