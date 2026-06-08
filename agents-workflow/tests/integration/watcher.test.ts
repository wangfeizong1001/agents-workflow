import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FileWatcher } from "../../src/watcher/index.js";

let dir: string;
let watcher: FileWatcher;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ys-watcher-"));
  mkdirSync(join(dir, ".yunshou"), { recursive: true });
  watcher = new FileWatcher(dir);
});

afterEach(() => {
  watcher.close();
});

describe("FileWatcher", () => {
  it("watch 不抛异常", () => {
    expect(() => watcher.watch(["events.jsonl"], () => {})).not.toThrow();
  });

  it("close 不抛异常", () => {
    watcher.watch([], () => {});
    expect(() => watcher.close()).not.toThrow();
  });

  it("文件变更触发回调", async () => {
    const events: unknown[] = [];
    watcher.watch(["events.jsonl"], (evts) => events.push(...evts));
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        writeFileSync(join(dir, ".yunshou", "events.jsonl"), "test\n");
        setTimeout(() => {
          watcher.close();
          resolve();
        }, 300);
      }, 100);
    });
    expect(events.length).toBeGreaterThan(0);
  }, 5000);
});
