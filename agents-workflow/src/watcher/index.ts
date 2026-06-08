import { watch, type FSWatcher } from "node:fs";
import { join, relative } from "node:path";

export interface FileEvent {
  readonly type: "change" | "rename";
  readonly filePath: string;
  readonly timestamp: string;
}

export class FileWatcher {
  private watcher: FSWatcher | null = null;
  private readonly watchDir: string;

  constructor(private readonly root: string) {
    this.watchDir = join(root, ".yunshou");
  }

  public watch(patterns: readonly string[], callback: (events: readonly FileEvent[]) => void): void {
    if (this.watcher) return;
    this.watcher = watch(this.watchDir, { recursive: true }, (eventType, filename) => {
      if (!filename) return;
      const rel = relative(this.watchDir, join(this.watchDir, filename.toString()));
      const matched = patterns.length === 0 || patterns.some((p) => rel.includes(p) || rel.endsWith(p));
      if (!matched) return;
      const ev: FileEvent = {
        type: eventType as "change" | "rename",
        filePath: rel,
        timestamp: new Date().toISOString(),
      };
      callback([ev]);
    });
  }

  public close(): void {
    this.watcher?.close();
    this.watcher = null;
  }
}
