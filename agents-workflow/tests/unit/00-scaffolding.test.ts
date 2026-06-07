import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..");

describe("工程脚手架", () => {
  it("package.json 必须存在并包含必需字段", () => {
    const pkg = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf-8"),
    ) as Record<string, unknown>;

    expect(pkg.name).toBe("@agents-workflow/yunshou");
    expect(pkg.version).toBe("0.1.0");
    expect(pkg.type).toBe("module");
    expect(pkg.engines).toMatchObject({ bun: ">=1.1.0" });
    expect(pkg.bin).toBeTypeOf("object");
  });

  it("package.json 必须声明可执行的 yunshou 入口", () => {
    const pkg = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf-8"),
    ) as { bin: Record<string, string> };

    expect(pkg.bin.yunshou).toBe("./dist/interfaces/cli/index.js");
  });

  it("package.json 的 scripts 必须包含 build/test/lint/typecheck", () => {
    const pkg = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf-8"),
    ) as { scripts: Record<string, string> };

    expect(pkg.scripts.build).toBeDefined();
    expect(pkg.scripts.test).toBeDefined();
    expect(pkg.scripts.lint).toBeDefined();
    expect(pkg.scripts.typecheck).toBeDefined();
  });

  it("package.json 必须将入口指向 src/index.ts", () => {
    const pkg = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf-8"),
    ) as {
      main: string;
      module: string;
      types: string;
      exports: Record<string, { types: string; import: string }>;
    };

    expect(pkg.main).toBe("./dist/index.js");
    expect(pkg.module).toBe("./dist/index.js");
    expect(pkg.types).toBe("./dist/index.d.ts");
    expect(pkg.exports["."].types).toBe("./dist/index.d.ts");
    expect(pkg.exports["."].import).toBe("./dist/index.js");
  });

  it("src/index.ts 必须导出 YunShouError、VERSION、createLogger", async () => {
    const mod = await import("../../src/index.ts");
    expect(mod.YunShouError).toBeTypeOf("function");
    expect(mod.VERSION).toBe("0.1.0");
    expect(mod.createLogger).toBeTypeOf("function");
  });
});
