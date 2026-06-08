// 模块职责: L5 知识提取 —— 从工具输出中提取 snippet 候选。
//
// 接口契约:
//   - extractSnippet(tool, output): 生成 KnowledgeEntry (kind=snippet)
//   - save(entries): 追加写入 l5.yaml

import { writeFileAtomic, readText, fileExists, ensureDir } from "../shared/fs-helpers.js";
import { dirname } from "node:path";
import { readYaml, writeYaml } from "../shared/yaml.js";
import type { KnowledgeEntry } from "../knowledge/types.js";

export class L5Extractor {
  constructor(private readonly file: string) {
    ensureDir(dirname(file));
  }

  public extractSnippet(tool: string, output: string): KnowledgeEntry {
    const head = output.split("\n").slice(0, 3).join("\n");
    return {
      id: `${tool}-${Date.now()}`,
      kind: "snippet",
      title: `${tool} 输出片段`,
      body: head,
      tags: [`tool:${tool}`],
      createdAt: new Date().toISOString(),
    };
  }

  public save(entries: readonly KnowledgeEntry[]): void {
    const existing = fileExists(this.file)
      ? (readYaml<{ entries?: KnowledgeEntry[] }>(readText(this.file)).entries ?? [])
      : [];
    writeFileAtomic(this.file, writeYaml({ entries: [...existing, ...entries] }));
  }
}
