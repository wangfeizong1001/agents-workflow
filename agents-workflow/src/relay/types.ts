/**
 * 协作同步类型定义
 */

/** 同步事件 */
export interface SyncEvent {
  readonly id: string;
  readonly type: string;
  readonly data: Readonly<Record<string, unknown>>;
  readonly clientId: string;
  readonly timestamp: number;
  readonly version: number;
}

/** 冲突解决策略 */
export type ConflictStrategy = "last-write-wins" | "merge" | "manual";

/** 冲突信息 */
export interface Conflict {
  readonly eventId: string;
  readonly clientA: string;
  readonly clientB: string;
  readonly eventA: SyncEvent;
  readonly eventB: SyncEvent;
  readonly resolution?: SyncEvent;
}

/** 同步状态 */
export interface SyncState {
  readonly clientId: string;
  readonly lastSyncedVersion: number;
  readonly pendingEvents: ReadonlyArray<SyncEvent>;
  readonly conflicts: ReadonlyArray<Conflict>;
}

/** 同步回调 */
export type SyncCallback = (event: SyncEvent) => void;
