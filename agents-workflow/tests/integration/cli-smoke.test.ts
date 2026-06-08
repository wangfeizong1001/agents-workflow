// 云枢 CLI 集成测试 —— 覆盖 init / status / --version 三个入口,验证 runCli 退出码契约。
//
// plan 缺陷已修 (实现行为优先, 与 plan 17.1 文字差异):
//   - 原 plan --version 测试用 console.log 拦截, 但 runCli 实现走 process.stdout.write,
//     console.log 拦不到。改用 process.stdout.write 拦截, 类型断言保留原签名兼容
//   - 项目 ESLint 规则 no-console 仅允许 warn/error, 本文件仅在 --version 测试
//     中临时替换 stdout.write (无 console.log 触发, 注释保留供后续维护者参考)
import { describe, it, expect, beforeEach, vi } from "vitest";
import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCli } from "../../src/interfaces/cli/index.js";

let cwd: string;
beforeEach(() => {
  cwd = mkdtempSync(join(tmpdir(), "ys-cli-"));
});

function collectStdout(): { out: string[]; restore: () => void } {
  const out: string[] = [];
  const orig = process.stdout.write.bind(process.stdout);
  vi.spyOn(process.stdout, "write").mockImplementation((s: unknown) => {
    out.push(String(s));
    return true;
  });
  return {
    out,
    restore: () => {
      process.stdout.write = orig;
    },
  };
}

function collectStderr(): { out: string[]; restore: () => void } {
  const out: string[] = [];
  const orig = process.stderr.write.bind(process.stderr);
  vi.spyOn(process.stderr, "write").mockImplementation((s: unknown) => {
    out.push(String(s));
    return true;
  });
  return {
    out,
    restore: () => {
      process.stderr.write = orig;
    },
  };
}

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

  it("yunshou init 成功时 stdout 必须包含确认信息", async () => {
    const s = collectStdout();
    const code = await runCli(["init"], cwd);
    expect(code).toBe(0);
    expect(s.out.join("")).toContain("已初始化云枢工作区");
    s.restore();
  });

  it("yunshou status 在未初始化目录必须返回非零", async () => {
    const code = await runCli(["status"], cwd);
    expect(code).toBe(2);
  });

  it("yunshou status 在未初始化目录 stderr 必须包含提示", async () => {
    const s = collectStderr();
    const code = await runCli(["status"], cwd);
    expect(code).toBe(2);
    expect(s.out.join("")).toContain("未初始化");
    s.restore();
  });

  it("yunshou status 在已初始化目录必须返回 0", async () => {
    await runCli(["init"], cwd);
    const code = await runCli(["status"], cwd);
    expect(code).toBe(0);
  });

  it("yunshou status 成功时 stdout 必须包含工作区状态", async () => {
    await runCli(["init"], cwd);
    const s = collectStdout();
    const code = await runCli(["status"], cwd);
    expect(code).toBe(0);
    expect(s.out.join("")).toContain("云枢工作区状态");
    s.restore();
  });

  it("yunshou --version 必须打印 0.1.0", async () => {
    const s = collectStdout();
    const code = await runCli(["--version"], cwd);
    expect(code).toBe(0);
    expect(s.out.join("")).toContain("0.1.0");
    s.restore();
  });

  it("yunshou -v 短参数必须打印 0.1.0", async () => {
    const s = collectStdout();
    const code = await runCli(["-v"], cwd);
    expect(code).toBe(0);
    expect(s.out.join("")).toContain("0.1.0");
    s.restore();
  });

  it("yunshou --help 必须打印帮助信息且退出码为 0", async () => {
    const s = collectStdout();
    const code = await runCli(["--help"], cwd);
    expect(code).toBe(0);
    expect(s.out.join("")).toContain("yunshou");
    expect(s.out.join("")).toContain("init");
    expect(s.out.join("")).toContain("status");
    s.restore();
  });

  it("yunshou 空参数必须打印帮助信息且退出码为 0", async () => {
    const s = collectStdout();
    const code = await runCli([], cwd);
    expect(code).toBe(0);
    expect(s.out.join("")).toContain("yunshou");
    s.restore();
  });

  it("yunshou 未知子命令必须返回退出码 1", async () => {
    const code = await runCli(["unknown"], cwd);
    expect(code).toBe(1);
  });

  it("yunshou 未知子命令 stderr 必须包含提示", async () => {
    const s = collectStderr();
    const code = await runCli(["unknown"], cwd);
    expect(code).toBe(1);
    expect(s.out.join("")).toContain("未知命令");
    s.restore();
  });
});
