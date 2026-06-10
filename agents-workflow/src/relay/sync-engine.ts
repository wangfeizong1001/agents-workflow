import type { SyncEvent, SyncState, SyncCallback, Conflict, ConflictStrategy } from "./types.js";
import { randomUUID } from "node:crypto";

/** 多人实时同步引擎 */
export class SyncEngine {
  private readonly events: SyncEvent[] = [];
  private readonly clients = new Map<string, SyncState>();
  private readonly callbacks: SyncCallback[] = [];
  private strategy: ConflictStrategy = "last-write-wins";

  /** 设置冲突解决策略 */
  public setStrategy(strategy: ConflictStrategy): void {
    this.strategy = strategy;
  }

  /** 注册同步回调 */
  public onSync(callback: SyncCallback): void {
    this.callbacks.push(callback);
  }

  /** 客户端加入同步 */
  public join(clientId: string): SyncState {
    const state: SyncEvent[] = [];
    const conflicts: Conflict[] = [];
    const syncState: SyncState = {
      clientId,
      lastSyncedVersion: this.events.length - 1,
      pendingEvents: state,
      conflicts,
    };
    this.clients.set(clientId, syncState);
    return syncState;
  }

  /** 客户端离开同步 */
  public leave(clientId: string): void {
    this.clients.delete(clientId);
  }

  /** 接收事件 */
  public receive(event: Omit<SyncEvent, "id" | "version">): SyncEvent {
    const fullEvent: SyncEvent = {
      ...event,
      id: randomUUID(),
      version: this.events.length,
    };

    this.events.push(fullEvent);

    // 检查冲突
    const conflicts = this.detectConflicts(fullEvent);
    if (conflicts.length > 0 && this.strategy === "last-write-wins") {
      this.resolveConflictsLastWriteWins(conflicts);
    }

    // 通知所有客户端
    for (const callback of this.callbacks) {
      callback(fullEvent);
    }

    return fullEvent;
  }

  /** 获取客户端状态 */
  public getState(clientId: string): SyncState | undefined {
    return this.clients.get(clientId);
  }

  /** 获取所有事件 */
  public getEvents(): ReadonlyArray<SyncEvent> {
    return this.events;
  }

  /** 获取客户端数量 */
  public clientCount(): number {
    return this.clients.size;
  }

  /** 检测冲突 */
  private detectConflicts(newEvent: SyncEvent): Conflict[] {
    const conflicts: Conflict[] = [];
    for (const event of this.events) {
      if (event.id === newEvent.id) continue;
      if (event.clientId === newEvent.clientId) continue;
      if (event.type === newEvent.type) {
        const timeDiff = Math.abs(event.timestamp - newEvent.timestamp);
        if (timeDiff < 1000) {
          conflicts.push({
            eventId: newEvent.id,
            clientA: event.clientId,
            clientB: newEvent.clientId,
            eventA: event,
            eventB: newEvent,
          });
        }
      }
    }
    return conflicts;
  }

  /** 最后写入者胜出解决冲突 */
  private resolveConflictsLastWriteWins(conflicts: Conflict[]): void {
    for (const conflict of conflicts) {
      const winner = conflict.eventA.timestamp > conflict.eventB.timestamp
        ? conflict.eventA
        : conflict.eventB;
      const resolved: Conflict = {
        ...conflict,
        resolution: winner,
      };
      conflicts[conflicts.indexOf(conflict)] = resolved;
    }
  }
}
