// L1 工具结果缓存条目。
//
// 设计权衡: lastUsedAt 与 hops 字段为可变,因为 L1Cache.get 会就地更新
// lastUsedAt (用于 LRU 淘汰), touch 会递增 hops (用于记忆层"同 key 被复用"信号)。
// 其他字段 (key/tool/args/value/createdAt) 保持 readonly, 表达"创建后不可变"的语义。
//
// 注: plan 14.2 原本将所有字段标为 readonly, 但 plan 14.3 的 get/touch 实现会
// 改写 lastUsedAt/hops, 两者矛盾 (plan 阶段引入的缺陷)。本次按"实现行为为准"
// 原则去掉这两个字段的 readonly, 其余保持不变。
export interface L1Entry {
  readonly key: string;
  readonly tool: string;
  readonly args: Readonly<Record<string, unknown>>;
  readonly value: unknown;
  readonly createdAt: string;
  lastUsedAt: string;
  hops: number;
}
