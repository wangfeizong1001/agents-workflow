// 云枢 Spec 子系统 —— 规格引擎核心 (阶段 6 任务 19)。
//
// 模块职责:
//   - SpecEngine.create(input): 渲染模板写入 .yunshou/specs/{id}.md,
//     前置质量门禁(正文长度 ≥ 200),通过后追加 spec.created 事件。
//   - SpecEngine.advance(id, to): 读取已有 spec,解析 YAML frontmatter,
//     构造 SpecState 交 SpecGuard.assertCanAdvance 校验,通过后重写 status
//     并追加 spec.phase.changed 事件。
//
// 接口契约:
//   - SpecEngineOptions.root 为项目根目录(与 yunshouPaths 入参一致)。
//   - create 返回 input.id,调用方需确保 id 唯一(外部不检查重复)。
//   - advance 的 to 必须是 "review" | "approved" | "archived" 之一。
//   - create 质量门禁检查 problem + goal 总长度,与 guard 的 body 长度门禁
//     构成两层防线(create 层做总量快检,guard 层做 body 精确校验)。

import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { writeFileAtomic, readText } from "../../shared/fs-helpers.js";
import { splitFrontmatter, readYaml, writeYaml } from "../../shared/yaml.js";
import { YunShouError, YSErrorCode } from "../../shared/errors.js";
import { renderSpecTemplate, type SpecTemplateInput } from "./template.js";
import { SpecGuard } from "../guard/spec-guard.js";
import type { StateStore } from "../state/store.js";

export interface SpecEngineOptions {
  readonly root: string;
  readonly store: StateStore;
}

const MIN_BODY = 200;

export class SpecEngine {
  private readonly guard = new SpecGuard();
  private readonly specsDir: string;

  constructor(private readonly opts: SpecEngineOptions) {
    this.specsDir = join(opts.root, ".yunshou", "specs");
    if (!existsSync(this.specsDir)) {
      mkdirSync(this.specsDir, { recursive: true });
    }
  }

  public create(input: SpecTemplateInput): string {
    if (input.problem.length + input.goal.length < MIN_BODY) {
      throw new YunShouError(
        "正文过短, 质量门禁未通过",
        YSErrorCode.SPEC_QUALITY_GATE_FAILED,
        { id: input.id },
      );
    }
    const md = renderSpecTemplate(input);
    const path = join(this.specsDir, `${input.id}.md`);
    writeFileAtomic(path, md);
    this.opts.store.append({ type: "spec.created", specId: input.id } as const);
    return input.id;
  }

  public advance(id: string, to: "review" | "approved" | "archived"): void {
    const path = join(this.specsDir, `${id}.md`);
    if (!existsSync(path)) {
      throw new YunShouError("规格不存在", YSErrorCode.FS_NOT_FOUND, { id });
    }
    const raw = readText(path);
    const { meta, body } = splitFrontmatter(raw);
    const fm = readYaml<Record<string, string>>(meta || "{}");
    const state = {
      id,
      title: fm["title"] ?? "",
      phase: (fm["status"] ?? "draft") as "draft" | "review" | "approved" | "archived",
      body,
      hasQuestions: false,
      hasDecisions: body.includes("## 关键决策"),
      scenarioCount: (body.match(/#### Scenario:/g) ?? []).length,
    };
    this.guard.assertCanAdvance(state, to);
    const newFm = { ...fm, status: to };
    writeFileAtomic(path, `---\n${writeYaml(newFm).trim()}\n---\n${body}`);
    this.opts.store.append({ type: "spec.phase.changed", specId: id, phase: to } as const);
  }
}
