// 云枢 Verify 子系统 —— 5 层验证引擎 (阶段 9 任务 26)。
//
// 模块职责:
//   - runAll(): 依次运行 lint / typecheck / test / build / spec-compliance,
//     返回 VerifyReport。
//   - requireAllPassed(report): 若任意层失败抛 VERIFY_LAYER_FAILED。
//
// 接口契约:
//   - runAll 接受可选 layers 参数, 默认全 5 层。
//   - 不存在 package.json 时跳过 lint/typecheck/test/build (标记为失败)。

import { existsSync } from "node:fs";
import { join } from "node:path";
import { YunShouError, YSErrorCode } from "../../shared/errors.js";
import { runLayer, LAYER_COMMANDS } from "./layer.js";
import type { LayerName, VerifyReport } from "./types.js";

export interface VerifyEngineOptions {
  readonly root: string;
}

export class VerifyEngine {
  constructor(private readonly opts: VerifyEngineOptions) {}

  public async runAll(layers: readonly LayerName[] = [
    "lint",
    "typecheck",
    "test",
    "build",
    "spec-compliance",
  ]): Promise<VerifyReport> {
    const start = new Date().toISOString();
    const results = [];
    for (const name of layers) {
      const hasPkg = existsSync(join(this.opts.root, "package.json"));
      if (!hasPkg && name !== "spec-compliance") {
        results.push({
          name,
          passed: false,
          stdout: "",
          stderr: "package.json 不存在,跳过此层",
          durationMs: 0,
        });
        continue;
      }
      results.push(await runLayer(name, this.opts.root, LAYER_COMMANDS[name]));
    }
    const end = new Date().toISOString();
    const overall = results.every((r) => r.passed);
    return { startedAt: start, finishedAt: end, layers: results, overall };
  }

  public requireAllPassed(report: VerifyReport): void {
    if (!report.overall) {
      const failed = report.layers.filter((l) => !l.passed).map((l) => l.name);
      throw new YunShouError(
        "验证未通过",
        YSErrorCode.VERIFY_LAYER_FAILED,
        { failed },
      );
    }
  }
}
