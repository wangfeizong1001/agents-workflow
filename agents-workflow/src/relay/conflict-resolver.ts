import type { SyncEvent, Conflict, ConflictStrategy } from "./types.js";

/** 冲突解决器 */
export class ConflictResolver {
  private strategy: ConflictStrategy = "last-write-wins";

  /** 设置解决策略 */
  public setStrategy(strategy: ConflictStrategy): void {
    this.strategy = strategy;
  }

  /** 解决冲突 */
  public resolve(conflict: Conflict): SyncEvent {
    switch (this.strategy) {
      case "last-write-wins":
        return this.resolveLastWriteWins(conflict);
      case "merge":
        return this.resolveMerge(conflict);
      case "manual":
        return conflict.eventA;
    }
  }

  /** 批量解决冲突 */
  public resolveAll(conflicts: ReadonlyArray<Conflict>): ReadonlyArray<SyncEvent> {
    return conflicts.map((c) => this.resolve(c));
  }

  /** 最后写入者胜出 */
  private resolveLastWriteWins(conflict: Conflict): SyncEvent {
    return conflict.eventA.timestamp >= conflict.eventB.timestamp
      ? conflict.eventA
      : conflict.eventB;
  }

  /** 合并解决 */
  private resolveMerge(conflict: Conflict): SyncEvent {
    const base = conflict.eventA.timestamp <= conflict.eventB.timestamp
      ? conflict.eventA
      : conflict.eventB;
    const other = base === conflict.eventA ? conflict.eventB : conflict.eventA;

    const mergedData = {
      ...(base.data as Record<string, unknown>),
      ...(other.data as Record<string, unknown>),
    };

    return {
      id: `merged-${base.id}-${other.id}`,
      type: base.type,
      data: mergedData,
      clientId: base.clientId,
      timestamp: Math.max(base.timestamp, other.timestamp),
      version: Math.max(base.version, other.version),
    };
  }
}
