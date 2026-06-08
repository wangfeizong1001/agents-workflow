// 云枢 Spec 子系统 —— Markdown 模板与占位符渲染 (阶段 6 任务 18)。
//
// 模块职责:
//   - 在构建期一次性加载 templates/spec.md.tmpl 模板文本
//   - 对外提供 renderSpecTemplate(input),把 {{key}} 占位符替换为 input 字段值
//   - 任一字段为空字符串 (falsy) 时抛 YunShouError(YAML_VALIDATION_FAILED),
//     context.field 标记首个空字段名,便于上游定位
//
// 接口契约:
//   - SpecTemplateInput 9 个字段全部 readonly,缺失任何一个都属契约违反
//   - 返回值是纯字符串,不带 BOM / CRLF 转换
//   - 模板路径基于 import.meta.url 解析,兼容单仓库 + monorepo 平移
//     HERE = src/core/spec/ 目录,上溯 3 层即仓库根 templates/
//
// 已知局限 (留待后续任务):
//   - 模板字段值不做 YAML/Markdown 转义 (例如含 "|" 的字段会破坏表格);
//     上游 spec 收集阶段应自行转义,本函数只做字面替换
//   - 不支持条件块 / 循环;后续若需要,应引入 mustache/handlebars 替代

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { YunShouError, YSErrorCode } from "../../shared/errors.js";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const TEMPLATE = readFileSync(join(HERE, "..", "..", "..", "templates", "spec.md.tmpl"), "utf-8");

export interface SpecTemplateInput {
  readonly id: string;
  readonly title: string;
  readonly date: string;
  readonly author: string;
  readonly problem: string;
  readonly goal: string;
  readonly nonGoals: string;
  readonly decisions: string;
  readonly scenarios: string;
  readonly risks: string;
}

export function renderSpecTemplate(input: SpecTemplateInput): string {
  for (const [k, v] of Object.entries(input)) {
    if (!v) {
      throw new YunShouError("模板字段为空", YSErrorCode.YAML_VALIDATION_FAILED, { field: k });
    }
  }
  return TEMPLATE.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    // 双重 as: SpecTemplateInput 是 interface (编译期擦除),不能直接索引 string。
    // 先用 unknown 绕过 TS 的结构类型检查,再用 Record<string, string> 允许任意键索引。
    // 运行时只要 key 正好是 SpecTemplateInput 的字段名即安全 —— 模板中 {{key}} 不会
    // 出现不在 input 中的占位符(维护者保证)。
    const v = (input as unknown as Record<string, string>)[key];
    return v ?? "";
  });
}
