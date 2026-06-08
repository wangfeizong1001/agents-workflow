import { execSync } from "node:child_process";

export interface TestReport {
  readonly passed: boolean;
  readonly stages: readonly StageResult[];
  readonly screenshots?: readonly string[];
  readonly error?: string;
}

export interface StageResult {
  readonly name: string;
  readonly passed: boolean;
  readonly output: string;
  readonly screenshot?: string;
}

export class L5Tester {
  constructor(private readonly root: string) {}

  public async runFlow(url: string, steps: readonly string[]): Promise<TestReport> {
    const stages: StageResult[] = [];

    for (const step of steps) {
      try {
        const output = execSync(`gstack browse "${url}" --eval "${step}"`, {
          cwd: this.root,
          encoding: "utf-8",
          timeout: 30_000,
          stdio: ["ignore", "pipe", "pipe"],
        });
        stages.push({ name: step, passed: true, output: output.trim() });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        stages.push({ name: step, passed: false, output: msg });
        return { passed: false, stages, error: `步骤 "${step}" 失败: ${msg}` };
      }
    }

    return { passed: stages.every((s) => s.passed), stages };
  }
}

export function createTestReport(passed: boolean, error?: string): TestReport {
  return { passed, stages: [], error };
}
