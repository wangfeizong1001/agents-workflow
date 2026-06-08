import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { readYaml, writeYaml } from "../shared/yaml.js";
import { writeFileAtomic, fileExists } from "../shared/fs-helpers.js";
import type { StateEvent } from "../core/state/event.js";
import type { KnowledgeEntry } from "../knowledge/types.js";

export class MemoryL4 {
  constructor(
    private readonly eventsFile: string,
    private readonly knowledgeFile: string,
  ) {}

  public compress(): number {
    const raw = readFileSync(this.eventsFile, "utf-8").trim();
    if (!raw) return 0;

    const lines = raw.split("\n");
    const events: StateEvent[] = lines.map((l) => JSON.parse(l) as StateEvent);
    const doneEvents = events.filter(
      (e) => e.type === "plan.task.completed",
    );

    let existing: { entries?: KnowledgeEntry[] } = { entries: [] };
    if (fileExists(this.knowledgeFile)) {
      existing = readYaml<{ entries?: KnowledgeEntry[] }>(
        readFileSync(this.knowledgeFile, "utf-8"),
      );
    }
    const existingTitles = new Set((existing.entries ?? []).map((e) => e.title));

    let added = 0;
    for (const e of doneEvents) {
      const title = `Task completed: ${e.taskId ?? e.id}`;
      if (existingTitles.has(title)) continue;

      const entry: KnowledgeEntry = {
        id: randomUUID(),
        kind: "pattern",
        title,
        body: `Task ${e.taskId ?? "unknown"} completed at ${e.ts}`,
        tags: ["task", "completed", ...(e.planId ? [e.planId] : [])],
        createdAt: new Date().toISOString(),
      };
      (existing.entries ??= []).push(entry);
      added++;
    }

    writeFileAtomic(this.knowledgeFile, writeYaml(existing));
    return added;
  }
}
