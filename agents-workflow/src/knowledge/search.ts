// 模块职责: 知识库全文搜索 —— 按关键词匹配 title / body / tags。
//
// 接口契约:
//   - search(entries, q) 返回大小写不敏感的匹配结果

import type { KnowledgeEntry } from "./types.js";

export function search(entries: readonly KnowledgeEntry[], q: string): KnowledgeEntry[] {
  const lower = q.toLowerCase();
  return entries.filter(
    (e) =>
      e.title.toLowerCase().includes(lower) ||
      e.body.toLowerCase().includes(lower) ||
      e.tags.some((t) => t.toLowerCase().includes(lower)),
  );
}
