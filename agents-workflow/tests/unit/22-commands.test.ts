import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  parseCommandContent,
  scanCommands,
  loadAllCommands,
  filterCommandsByCategory,
} from "../../src/commands/index.js";

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "ys-commands-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

const SAMPLE_COMMAND = `---
name: health
description: 健康
skill: health
trigger: /health
category: 日常类
---

## /health 命令

### 用法
/health [检查范围]

### 参数
- \`--quick\`: 快速检查
- \`--full\`: 全面检查
- \`--fix\`: 自动修复

### 行为
1. 执行健康检查
2. 评估代码质量
`;

describe("Command 引擎", () => {
  it("parseCommandContent 应解析 frontmatter", () => {
    const def = parseCommandContent(SAMPLE_COMMAND, "/test.md");
    expect(def.name).toBe("health");
    expect(def.description).toBe("健康");
    expect(def.skill).toBe("health");
    expect(def.trigger).toBe("/health");
    expect(def.category).toBe("daily");
  });

  it("parseCommandContent 应解析参数", () => {
    const def = parseCommandContent(SAMPLE_COMMAND, "/test.md");
    expect(def.params).toHaveLength(3);
    expect(def.params[0]?.name).toBe("--quick");
    expect(def.params[0]?.description).toBe("快速检查");
    expect(def.params[1]?.name).toBe("--full");
    expect(def.params[2]?.name).toBe("--fix");
  });

  it("parseCommandContent 应解析用法", () => {
    const def = parseCommandContent(SAMPLE_COMMAND, "/test.md");
    expect(def.usage).toBe("/health [检查范围]");
  });

  it("scanCommands 应扫描目录下所有命令", () => {
    writeFileSync(join(dir, "health.md"), SAMPLE_COMMAND, "utf-8");
    writeFileSync(
      join(dir, "debug.md"),
      `---\nname: debug\ndescription: 调试\nskill: debug\ntrigger: /debug\n---\n## /debug\n### 用法\ndebug [问题]`,
      "utf-8",
    );

    const commands = scanCommands(dir);
    expect(commands).toHaveLength(2);
    expect(commands.map((c) => c.name).sort()).toEqual(["debug", "health"]);
  });

  it("loadAllCommands 应返回注册表", () => {
    writeFileSync(join(dir, "health.md"), SAMPLE_COMMAND, "utf-8");

    const registry = loadAllCommands(dir);
    expect(registry.size).toBe(1);
    expect(registry.has("health")).toBe(true);
  });

  it("filterCommandsByCategory 应按分类过滤", () => {
    writeFileSync(join(dir, "health.md"), SAMPLE_COMMAND, "utf-8");
    writeFileSync(
      join(dir, "debug.md"),
      `---\nname: debug\ndescription: 调试\nskill: debug\ntrigger: /debug\ncategory: 调试类\n---\n## /debug`,
      "utf-8",
    );

    const registry = loadAllCommands(dir);
    const daily = filterCommandsByCategory(registry, "daily");
    expect(daily).toHaveLength(1);
    expect(daily[0]?.name).toBe("health");
  });
});
