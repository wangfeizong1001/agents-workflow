export interface AutoDriverOptions {
  readonly cwd: string;
  readonly planId: string;
  readonly injectPrompt: (prompt: string) => Promise<string>;
  readonly maxIterations?: number;
}

export interface DriveResult {
  readonly completedTasks: number;
  readonly allCompleted: boolean;
  readonly error?: string;
}

export class AutoDriver {
  constructor(private readonly options: AutoDriverOptions) {}

  public async drive(): Promise<DriveResult> {
    const maxIter = this.options.maxIterations ?? 10;
    let completed = 0;

    for (let i = 0; i < maxIter; i++) {
      try {
        const { execSync } = await import("node:child_process");
        const prompt = execSync(`yunshou execute next --plan-id ${this.options.planId}`, {
          cwd: this.options.cwd,
          encoding: "utf-8",
          timeout: 10_000,
        }).trim();

        if (prompt.includes("所有任务已完成") || prompt.includes("no more tasks")) {
          return { completedTasks: completed, allCompleted: true };
        }

        const taskIdLine = prompt.split("\n").find((l) => l.startsWith("任务"));
        const taskId = taskIdLine?.match(/任务\s+(\S+)/)?.[1] ?? `task-${i}`;
        const result = await this.options.injectPrompt(prompt);
        execSync(`yunshou execute complete --plan-id ${this.options.planId} --task-id ${taskId}`, {
          cwd: this.options.cwd,
          encoding: "utf-8",
          timeout: 10_000,
        });
        completed++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { completedTasks: completed, allCompleted: false, error: msg };
      }
    }

    return { completedTasks: completed, allCompleted: false, error: "达到最大迭代次数" };
  }
}
