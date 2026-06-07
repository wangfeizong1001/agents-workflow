import { describe, it, expect } from "vitest";
import { readYaml, writeYaml, splitFrontmatter } from "../../src/shared/yaml.js";
import { YunShouError } from "../../src/shared/errors.js";

describe("yaml 模块", () => {
  it("readYaml 必须解析简单 YAML 字符串为对象", () => {
    const out = readYaml<{ a: number }>("a: 1\n");
    expect(out.a).toBe(1);
  });

  it("readYaml 对无效 YAML 必须抛 YAML_PARSE_FAILED 错误", () => {
    expect(() => readYaml("a: : :")).toThrow(YunShouError);
  });

  it("splitFrontmatter 必须将 frontmatter 与正文分开", () => {
    const raw = "---\ntitle: hi\n---\n# 正文\n";
    const { meta, body } = splitFrontmatter(raw);
    expect(meta).toBe("title: hi\n");
    expect(body).toBe("# 正文\n");
  });

  it("splitFrontmatter 对无 frontmatter 文件必须返回空 meta", () => {
    const { meta, body } = splitFrontmatter("# 纯正文\n");
    expect(meta).toBe("");
    expect(body).toBe("# 纯正文\n");
  });

  it("writeYaml 必须生成可被 YAML.parse 反向解析的字符串", () => {
    const s = writeYaml({ a: 1, b: ["x", "y"] });
    expect(s).toContain("a: 1");
    expect(s).toContain("b:");
  });
});
