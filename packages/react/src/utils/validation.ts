import { validate } from "@atari-engine/core";
import type { RuleGroup } from "../types";

export function pathForCondition(
  groupPath: number[],
  conditionIndex: number,
): string {
  const segments = [...groupPath, conditionIndex];
  return segments.map((s) => `conditions[${s}]`).join(".");
}

export function buildValidationErrorsMap(
  value: RuleGroup,
): Map<string, string[]> {
  const result = validate(value);
  const map = new Map<string, string[]>();
  if (result.valid) return map;
  for (const err of result.errors) {
    const list = map.get(err.path) ?? [];
    list.push(err.message);
    map.set(err.path, list);
  }
  return map;
}
