import { readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import type { StateEvent } from "../core/state/event.js";

export class MemoryL6 {
  constructor(
    private readonly eventsFile: string,
    private readonly knowledgeFile: string,
  ) {}

  public dream(): number {
    const raw = readFileSync(this.eventsFile, "utf-8").trim();
    if (!raw) return 0;

    const lines = raw.split("\n");
    const events: StateEvent[] = lines.map((l) => JSON.parse(l) as StateEvent);
    const compressed = events.filter(
      (e) => !!(e as StateEvent & { data?: { compressed?: boolean } }).data?.compressed,
    );
    const active = events.filter(
      (e) => !(e as StateEvent & { data?: { compressed?: boolean } }).data?.compressed,
    );

    if (compressed.length === 0 || active.length === 0) return 0;

    const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
    const c = pick(compressed);
    const a = pick(active);

    const cTags: string[] = (c as StateEvent & { data?: { tags?: string[] } }).data?.tags ?? [];
    const aTags = [a.specId, a.planId, a.taskId, a.type].filter(Boolean) as string[];
    const intersection = cTags.filter((t) => aTags.includes(t));

    const association: StateEvent = {
      id: randomUUID(),
      ts: new Date().toISOString(),
      session: "l6-dream",
      type: a.type,
      data: {
        dream: true,
        sourceCompressedId: c.id,
        sourceActiveId: a.id,
        sharedTags: intersection,
        associationScore: intersection.length > 0 ? "strong" : "weak",
      },
    };

    writeFileSync(
      this.eventsFile,
      raw + "\n" + JSON.stringify(association) + "\n",
      "utf-8",
    );
    return 1;
  }
}
