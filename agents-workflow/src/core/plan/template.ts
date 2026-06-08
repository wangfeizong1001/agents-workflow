import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const TEMPLATE = readFileSync(
  join(HERE, "..", "..", "..", "templates", "plan.md.tmpl"),
  "utf-8",
);

export interface PlanTemplateInput {
  readonly id: string;
  readonly title: string;
  readonly specId: string;
  readonly date: string;
  readonly body: string;
}

export function renderPlanTemplate(input: PlanTemplateInput): string {
  return TEMPLATE.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = (input as unknown as Record<string, string>)[key];
    return v ?? "";
  });
}
