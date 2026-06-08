export type LayerName = "lint" | "typecheck" | "test" | "build" | "spec-compliance";

export interface LayerResult {
  readonly name: LayerName;
  readonly passed: boolean;
  readonly stdout: string;
  readonly stderr: string;
  readonly durationMs: number;
}

export interface VerifyReport {
  readonly startedAt: string;
  readonly finishedAt: string;
  readonly layers: readonly LayerResult[];
  readonly overall: boolean;
}
