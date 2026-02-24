import type { RuleBuilderLabels, RuleGroup } from "../types";
import { LOGICAL_OPERATORS } from "@atari-engine/core";

export const DEFAULT_LABELS: RuleBuilderLabels = {
  addRule: "Add Rule",
  addGroup: "Add Group",
  removeRule: "Remove",
  removeGroup: "Remove Group",
  fieldPlaceholder: "Select field...",
  valuePlaceholder: "Enter value...",
  logicalAnd: "AND",
  logicalOr: "OR",
};

const CONDITION_ID_KEY = "_id" as const;

export function createEmptyRuleGroup(
  logicalOperator: keyof typeof LOGICAL_OPERATORS = "AND",
): RuleGroup {
  return {
    logicalOperator: LOGICAL_OPERATORS[logicalOperator],
    conditions: [],
    [CONDITION_ID_KEY]: crypto.randomUUID(),
  } as RuleGroup;
}

export function getConditionKey(
  condition: unknown,
  groupPath: number[],
  index: number,
): string {
  const withId = condition as { _id?: string };
  return withId?._id ?? `fallback-${groupPath.join("-")}-${index}`;
}

export function mergeLabels(
  overrides?: Partial<RuleBuilderLabels>,
): RuleBuilderLabels {
  return { ...DEFAULT_LABELS, ...overrides };
}
