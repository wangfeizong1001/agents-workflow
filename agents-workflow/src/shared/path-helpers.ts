import { join, relative, resolve, sep } from "node:path";

export interface YunshouPaths {
  readonly root: string;
  readonly state: string;
  readonly events: string;
  readonly specs: string;
  readonly plans: string;
  readonly memory: string;
  readonly knowledge: string;
  readonly tasks: string;
}

export function yunshouPaths(root: string): YunshouPaths {
  return {
    root,
    state: join(root, ".yunshou"),
    events: join(root, ".yunshou", "events.jsonl"),
    specs: join(root, ".yunshou", "specs"),
    plans: join(root, ".yunshou", "plans"),
    memory: join(root, ".yunshou", "memory"),
    knowledge: join(root, ".yunshou", "knowledge"),
    tasks: join(root, ".yunshou", "tasks"),
  };
}

export function toRelative(absolute: string, cwd: string): string {
  return relative(cwd, absolute).split(sep).join("/");
}

export function toAbsolute(rel: string, cwd: string): string {
  return resolve(cwd, rel);
}

export function isInside(child: string, parent: string): boolean {
  const rel = relative(parent, child);
  return rel.length > 0 && !rel.startsWith("..") && !resolve(child).startsWith("..");
}
