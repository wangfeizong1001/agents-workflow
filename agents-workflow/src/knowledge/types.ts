export type KnowledgeKind = "snippet" | "pattern" | "decision" | "glossary";

export interface KnowledgeEntry {
  readonly id: string;
  readonly kind: KnowledgeKind;
  readonly title: string;
  readonly body: string;
  readonly tags: readonly string[];
  readonly createdAt: string;
}
