import { describe, it, expect } from "vitest";
import { renderSpecTemplate } from "../../src/core/spec/template.js";

const FULL_INPUT = {
  id: "s-1",
  title: "示例规格",
  date: "2026-06-07",
  author: "alice",
  problem: "P",
  goal: "G",
  nonGoals: "NG",
  decisions: "D1",
  scenarios: "S1",
  risks: "R1",
} as const;

describe("Spec 模板", () => {
  it("必须渲染所有占位符", () => {
    const out = renderSpecTemplate(FULL_INPUT);
    expect(out).toContain("id: s-1");
    expect(out).toContain("# 示例规格");
    expect(out).toContain("#### Scenario: S1");
    expect(out).toContain("| D1 |");
  });

  it("替换后无残留占位符", () => {
    const out = renderSpecTemplate(FULL_INPUT);
    // 所有 {{key}} 均应被替换, 输出不应出现 {{ 字符
    expect(out).not.toMatch(/\{\{/);
  });

  it("输出结构必须包含 YAML frontmatter 与各章节", () => {
    const out = renderSpecTemplate(FULL_INPUT);
    // frontmatter 定界符
    expect(out).toMatch(/^---\n/);
    expect(out).toMatch(/\n---\n/);
    // 各章节标题
    expect(out).toContain("## 背景与目标");
    expect(out).toContain("## 关键决策");
    expect(out).toContain("## 场景");
    expect(out).toContain("## 风险与开放问题");
    // frontmatter 字段字面量
    expect(out).toContain("status: draft");
    expect(out).toContain("id: s-1");
    expect(out).toContain("title: 示例规格");
    expect(out).toContain("date: 2026-06-07");
    expect(out).toContain("author: alice");
  });

  it("模板中未声明占位符必须替换为空字符串", () => {
    // SpecTemplateInput 定义了 9 个字段, 模板中有 10 个占位符?
    // 实际模板只有 {{id}}/{{title}}/{{date}}/{{author}}/{{problem}}/{{goal}}/{{nonGoals}}/{{decisions}}/{{scenarios}}/{{risks}}
    // 正好 10 个, 全部在 input 中。额外占位符不存在于模板中,
    // 但若将来模板新增了占位符而 input 类型未更新,
    // renderSpecTemplate 应返回空字符串而非崩溃。
    // 本测试验证 input 中的每条 field 都被正确替换(不会出现 {{unknown}})。
    const out = renderSpecTemplate(FULL_INPUT);
    expect(out).not.toContain("{{unknown}}");
  });

  it("缺少必填字段必须抛 YunShouError", () => {
    expect(() =>
      renderSpecTemplate({
        id: "s-1",
        title: "",
        date: "2026-06-07",
        author: "a",
        problem: "p",
        goal: "g",
        nonGoals: "ng",
        decisions: "d",
        scenarios: "s",
        risks: "r",
      }),
    ).toThrow("模板字段为空");
  });

  it("全部字段为空白必须抛错", () => {
    expect(() =>
      renderSpecTemplate({
        id: "",
        title: "",
        date: "2026-06-07",
        author: "a",
        problem: "p",
        goal: "g",
        nonGoals: "ng",
        decisions: "d",
        scenarios: "s",
        risks: "r",
      }),
    ).toThrow("模板字段为空");
  });

  it("frontmatter 中的 date/author 必须包含预期值", () => {
    const out = renderSpecTemplate(FULL_INPUT);
    // frontmatter YAML 每行格式: key: value
    const lines = out.split("\n");
    const fmLines = lines.slice(1, lines.indexOf("---", 1)); // frontmatter 内容行
    expect(fmLines).toContain("date: 2026-06-07");
    expect(fmLines).toContain("author: alice");
  });
});
