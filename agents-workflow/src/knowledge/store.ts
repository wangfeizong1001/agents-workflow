// 模块职责: 知识库存储 —— 4 类条目 (片段/模式/决策/术语) 的持久化。
//
// 接口契约:
//   - KnowledgeStore(file) 通过 YAML 文件读写;每个 add* 方法追加条目

import { randomUUID } from "node:crypto";
import { writeFileAtomic, readText, fileExists } from "../shared/fs-helpers.js";
import { readYaml, writeYaml } from "../shared/yaml.js";
import type { KnowledgeEntry, KnowledgeKind } from "./types.js";

export class KnowledgeStore {
  constructor(private readonly file: string) {}

  public list(): KnowledgeEntry[] {
    if (!fileExists(this.file)) return [];
    const data = readYaml<{ entries?: KnowledgeEntry[] }>(readText(this.file));
    return data.entries ?? [];
  }

  public addSnippet(title: string, body: string, tags: Record<string, string>): KnowledgeEntry {
    return this.add("snippet", title, body, Object.entries(tags).map(([k, v]) => `${k}:${v}`));
  }

  public addPattern(title: string, body: string, steps: readonly string[]): KnowledgeEntry {
    return this.add("pattern", title, `${body}\n\n${steps.map((s) => `- ${s}`).join("\n")}`, []);
  }

  public addDecision(title: string, reason: string, tags: Record<string, string>): KnowledgeEntry {
    return this.add("decision", title, reason, Object.entries(tags).map(([k, v]) => `${k}:${v}`));
  }

  private add(kind: KnowledgeKind, title: string, body: string, tags: readonly string[]): KnowledgeEntry {
    const entry: KnowledgeEntry = {
      id: randomUUID().slice(0, 8),
      kind,
      title,
      body,
      tags,
      createdAt: new Date().toISOString(),
    };
    const all = this.list();
    writeFileAtomic(this.file, writeYaml({ entries: [...all, entry] }));
    return entry;
  }
}
