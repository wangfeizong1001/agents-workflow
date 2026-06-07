// 云枢 CLI 集成测试 —— 覆盖 init / status / --version 三个入口,验证 runCli 退出码契约。
//
// plan 缺陷已修 (实现行为优先, 与 plan 17.1 文字差异):
//   - 原 plan --version 测试用 console.log 拦截, 但 runCli 实现走 process.stdout.write,
//     console.log 拦不到。改用 process.stdout.write 拦截, 类型断言保留原签名兼容
//   - 项目 ESLint 规则 no-console 仅允许 warn/error, 本文件仅在 --version 测试
//     中临时替换 stdout.write (无 console.log 触发, 注释保留供后续维护者参考)
import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCli } from "../../src/interfaces/cli/index.js";

let cwd: string;
beforeEach(() => {
  cwd = mkdtempSync(join(tmpdir(), "ys-cli-"));
});

describe("CLI 集成", () => {
  it("yunshou init 必须在当前目录创建 .yunshou/ 工作区", async () => {
    const code = await runCli(["init"], cwd);
    expect(code).toBe(0);
    expect(existsSync(join(cwd, ".yunshou"))).toBe(true);
    expect(existsSync(join(cwd, ".yunshou", "events.jsonl"))).toBe(true);
    expect(existsSync(join(cwd, ".yunshou", "config.yaml"))).toBe(true);
  });

  it("yunshou init 已存在时必须报错", async () => {
    await runCli(["init"], cwd);
    const code = await runCli(["init"], cwd);
    expect(code).toBe(1);
  });

  it("yunshou status 在未初始化目录必须返回非零", async () => {
    const code = await runCli(["status"], cwd);
    expect(code).toBe(2);
  });

  it("yunshou status 在已初始化目录必须返回 0", async () => {
    await runCli(["init"], cwd);
    const code = await runCli(["status"], cwd);
    expect(code).toBe(0);
  });

  it("yunshou --version 必须打印 0.1.0", async () => {
    const out: string[] = [];
    const orig = process.stdout.write.bind(process.stdout);
    // 类型断言: stdout.write 签名是 (str: string | Uint8Array, ...) => boolean,
    // 拦截器只处理 string 路径, 实际 runCli 走 string 分支
    (process.stdout as unknown as { write: (s: string) => boolean }).write = (s: string) => {
      out.push(s);
      return true;
    };
    try {
      const code = await runCli(["--version"], cwd);
      expect(code).toBe(0);
      expect(out.join("")).toContain("0.1.0");
    } finally {
      process.stdout.write = orig;
    }
  });
});
