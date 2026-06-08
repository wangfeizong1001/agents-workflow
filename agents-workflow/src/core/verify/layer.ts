import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { LayerName, LayerResult } from "./types.js";

const exec = promisify(execFile);

export async function runLayer(
  name: LayerName,
  cwd: string,
  cmd: readonly string[],
): Promise<LayerResult> {
  const start = Date.now();
  try {
    const { stdout, stderr } = await exec(cmd[0] ?? "", [...cmd.slice(1)], {
      cwd,
      maxBuffer: 8 * 1024 * 1024,
    });
    return {
      name,
      passed: true,
      stdout: stdout.slice(-4000),
      stderr: stderr.slice(-4000),
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string };
    return {
      name,
      passed: false,
      stdout: (e.stdout ?? "").slice(-4000),
      stderr: (e.stderr ?? "").slice(-4000),
      durationMs: Date.now() - start,
    };
  }
}

export const LAYER_COMMANDS: Readonly<Record<LayerName, readonly string[]>> = {
  lint: ["bun", "run", "lint"],
  typecheck: ["bun", "run", "typecheck"],
  test: ["bun", "run", "test"],
  build: ["bun", "run", "build"],
  "spec-compliance": ["echo", "spec compliance is a noop in v0.1"],
};
