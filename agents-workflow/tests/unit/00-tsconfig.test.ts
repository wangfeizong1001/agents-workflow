import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..");

describe("TypeScript 与工具链配置", () => {
  it("tsconfig.json 必须启用 strict + noUncheckedIndexedAccess", () => {
    const cfg = JSON.parse(
      readFileSync(join(ROOT, "tsconfig.json"), "utf-8"),
    ) as { compilerOptions: Record<string, unknown> };

    expect(cfg.compilerOptions.strict).toBe(true);
    expect(cfg.compilerOptions.noUncheckedIndexedAccess).toBe(true);
    expect(cfg.compilerOptions.noImplicitOverride).toBe(true);
    expect(cfg.compilerOptions.exactOptionalPropertyTypes).toBe(true);
    expect(cfg.compilerOptions.target).toBe("ES2022");
    expect(cfg.compilerOptions.module).toBe("NodeNext");
    expect(cfg.compilerOptions.moduleResolution).toBe("NodeNext");
  });

  it("tsconfig.build.json 必须排除测试文件", () => {
    const cfg = JSON.parse(
      readFileSync(join(ROOT, "tsconfig.build.json"), "utf-8"),
    ) as { exclude: string[] };

    expect(cfg.exclude).toContain("tests/**/*");
    expect(cfg.exclude).toContain("vitest.config.ts");
  });

  it("vitest.config.ts 必须配置单线程运行以避免 JSONL 文件竞争", async () => {
    const cfg = (await import("../../vitest.config.ts" as string)) as {
      default: { test: { fileParallelism: boolean; pool: string } };
    };
    expect(cfg.default.test.fileParallelism).toBe(false);
    expect(cfg.default.test.pool).toBe("forks");
  });

  it(".gitignore 必须忽略 dist node_modules coverage .yunshou", () => {
    const text = readFileSync(join(ROOT, ".gitignore"), "utf-8");
    for (const entry of ["dist", "node_modules", "coverage", ".yunshou", "*.log"]) {
      expect(text).toContain(entry);
    }
  });

  it("CI 工作流文件必须存在并以 ubuntu-latest 跑 lint+typecheck+test+build", () => {
    const wfPath = join(ROOT, ".github", "workflows", "ci.yml");
    expect(existsSync(wfPath)).toBe(true);
    const text = readFileSync(wfPath, "utf-8");
    expect(text).toContain("ubuntu-latest");
    expect(text).toContain("bun install");
    expect(text).toContain("bun run lint");
    expect(text).toContain("bun run typecheck");
    expect(text).toContain("bun run test");
    expect(text).toContain("bun run build");
  });
});
