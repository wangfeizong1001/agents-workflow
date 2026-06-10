/**
 * Skills 引擎类型定义
 * 将 SKILL.md 文档转化为结构化指令集
 */

/** 单个技能的元数据 */
export interface SkillMeta {
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly location: string;
}

/** 加载后的完整技能内容 */
export interface SkillContent {
  readonly meta: SkillMeta;
  readonly markdown: string;
  readonly instructions: string;
}

/** 技能注册表 */
export type SkillRegistry = ReadonlyMap<string, SkillContent>;

/** 技能分类 */
export type SkillCategory =
  | "quality"
  | "delivery"
  | "planning"
  | "design"
  | "review"
  | "debug"
  | "security"
  | "docs"
  | "tools"
  | "other";

/** 技能搜索选项 */
export interface SkillSearchOptions {
  readonly category?: SkillCategory;
  readonly query?: string;
}
