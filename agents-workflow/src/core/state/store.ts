import { randomUUID } from "node:crypto";
import { dirname } from "node:path";
import { appendLine, readLines } from "../../shared/jsonl.js";
import { ensureDir } from "../../shared/fs-helpers.js";
import type { StateEvent, StateEventInput, StateEventType } from "./event.js";

export type { StateEvent, StateEventInput, StateEventType } from "./event.js";

// 同一 StateStore 实例共享一个 session id,便于按会话切片分析
function newSessionId(): string {
  return `${Date.now()}-${randomUUID().slice(0, 8)}`;
}

// 事件溯源风格的状态存储:append 自动注入 id/ts/session 元数据
// 设计目标:
// 1. 调用方只关心业务字段(type/specId/...);基础设施字段由 store 兜底
// 2. 追加写、读全量、按类型过滤、查最新 —— 四个原子操作覆盖阶段 1 全部需求
// 3. JSONL 行式存储,人类可读、便于事后审计与 grep
export class StateStore {
  private readonly session: string;

  constructor(private readonly filePath: string) {
    this.session = newSessionId();
    ensureDir(dirname(filePath));
  }

  public append(partial: StateEventInput): StateEvent {
    const event: StateEvent = {
      id: randomUUID(),
      ts: new Date().toISOString(),
      session: this.session,
      ...partial,
    };
    appendLine(this.filePath, event);
    return event;
  }

  public read(): readonly StateEvent[] {
    return readLines<StateEvent>(this.filePath);
  }

  public filterByType(type: StateEventType): readonly StateEvent[] {
    return this.read().filter((e) => e.type === type);
  }

  public latestByType(type: StateEventType): StateEvent | undefined {
    const list = this.filterByType(type);
    return list.at(-1);
  }
}

// 便捷函数式 API —— 适用于无状态场景(每个调用自建匿名 session)
// 与 StateStore 类共享底层 shared/jsonl,行为一致

export function appendEvent(
  filePath: string,
  partial: StateEventInput,
): StateEvent {
  ensureDir(dirname(filePath));
  const event: StateEvent = {
    id: randomUUID(),
    ts: new Date().toISOString(),
    session: newSessionId(),
    ...partial,
  };
  appendLine(filePath, event);
  return event;
}

export function readEvents(filePath: string): readonly StateEvent[] {
  return readLines<StateEvent>(filePath);
}
