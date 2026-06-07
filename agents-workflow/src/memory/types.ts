export interface L1Entry {
  readonly key: string;
  readonly tool: string;
  readonly args: Readonly<Record<string, unknown>>;
  readonly value: unknown;
  readonly createdAt: string;
  readonly lastUsedAt: string;
  readonly hops: number;
}
