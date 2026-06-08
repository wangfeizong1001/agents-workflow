import { readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import type { StateEvent } from "../core/state/event.js";

const WINDOW = 50;
const GROUP_SIZE = 5;

export class MemoryL2 {
  constructor(private readonly eventsFile: string) {}

  public compress(): number {
    const raw = readFileSync(this.eventsFile, "utf-8").trim();
    if (!raw) return 0;

    const lines = raw.split("\n");
    const events: StateEvent[] = lines.map((l) => JSON.parse(l) as StateEvent);
    const start = Math.max(0, events.length - WINDOW);
    const tail = events.slice(start);
    let compressedCount = 0;
    let pos = 0;

    while (pos + GROUP_SIZE <= tail.length) {
      const batch = tail.slice(pos, pos + GROUP_SIZE);
      const types = batch.map((e) => e.type);
      if (
        types.every((t) => t === types[0]) &&
        !batch.some((e) => !!(e as StateEvent & { compressed?: boolean }).compressed)
      ) {
        const tags = [...new Set(batch.map((e) => e.specId ?? e.planId ?? "").filter(Boolean))];
        const last = tail[pos]!;
        const compressed: StateEvent & { compressed: boolean } = {
          id: randomUUID(),
          ts: new Date().toISOString(),
          session: "l2-compressor",
          type: types[0]!,
          data: {
            compressed: true,
            sourceCount: GROUP_SIZE,
            sourceIds: batch.map((e) => e.id),
            tags,
          },
          compressed: true,
          ...(last.specId !== undefined ? { specId: last.specId } : {}),
          ...(last.planId !== undefined ? { planId: last.planId } : {}),
        };
        tail.splice(pos, GROUP_SIZE, compressed);
        compressedCount++;
        pos++;
      } else {
        pos++;
      }
    }

    const result = [...events.slice(0, start), ...tail];
    writeFileSync(this.eventsFile, result.map((e) => JSON.stringify(e)).join("\n") + "\n", "utf-8");
    return compressedCount;
  }
}
