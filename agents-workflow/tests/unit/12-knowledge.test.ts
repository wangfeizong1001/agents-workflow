import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { KnowledgeStore } from "../../src/knowledge/store.js";
import { search } from "../../src/knowledge/search.js";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ys-kb-"));
});

describe("知识库", () => {
  it("addSnippet 必须按 type 分类存储", () => {
    const kb = new KnowledgeStore(join(dir, "kb.yaml"));
    kb.addSnippet("name 1", "echo 'hi'", { lang: "sh" });
    kb.addPattern("name 2", "如何拆分任务", ["写任务 1", "写任务 2"]);
    const all = kb.list();
    expect(all).toHaveLength(2);
  });

  it("search 必须按关键词命中 snippet/pattern/decision/glossary", () => {
    const kb = new KnowledgeStore(join(dir, "kb.yaml"));
    kb.addSnippet("grep 用法", "rg pattern -A 2 file", {});
    kb.addDecision("不用 lodash", "bundle 体积", { date: "2026-06-07" });
    const res = search(kb.list(), "lodash");
    expect(res[0]?.title).toBe("不用 lodash");
  });
});
