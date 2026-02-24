import { useCallback } from "react";
import {
  FIELD_TYPES,
  isRuleGroup,
  LOGICAL_OPERATORS,
  OPERATORS,
} from "@atari-engine/core";
import type { LogicalOperator, Rule, RuleGroup } from "../types";
import { createEmptyRuleGroup } from "../utils/defaults";

export type GroupPath = number[];

function getGroupAt(root: RuleGroup, path: GroupPath): RuleGroup {
  let current: RuleGroup = root;
  for (const i of path) {
    const next = current.conditions[i];
    if (!next || !isRuleGroup(next)) {
      throw new Error(`Path does not point to a RuleGroup`);
    }
    current = next;
  }
  return current;
}

function setGroupAt(
  root: RuleGroup,
  path: GroupPath,
  replaceWith: RuleGroup,
): RuleGroup {
  if (path.length === 0) return replaceWith;
  const parentPath = path.slice(0, -1);
  const index = path[path.length - 1];
  const parent = getGroupAt(root, parentPath);
  const newConditions = parent.conditions.slice();
  newConditions[index] = replaceWith;
  const newParent: RuleGroup = { ...parent, conditions: newConditions };
  return setGroupAt(root, parentPath, newParent);
}

export function createDefaultRule(): Rule {
  return {
    fieldName: "",
    fieldType: FIELD_TYPES.STRING,
    operator: OPERATORS.EQUALS,
    value: null,
    _id: crypto.randomUUID(),
  } as Rule & { _id?: string };
}

export function useRuleGroupActions(
  value: RuleGroup,
  onChange: (value: RuleGroup) => void,
) {
  const addRule = useCallback(
    (groupPath: GroupPath, rule?: Rule) => {
      const group = getGroupAt(value, groupPath);
      const newConditions = [...group.conditions, rule ?? createDefaultRule()];
      const newGroup: RuleGroup = { ...group, conditions: newConditions };
      onChange(setGroupAt(value, groupPath, newGroup));
    },
    [value, onChange],
  );

  const addGroup = useCallback(
    (
      groupPath: GroupPath,
      logicalOperator: keyof typeof LOGICAL_OPERATORS = "AND",
    ) => {
      const group = getGroupAt(value, groupPath);
      const newChild = createEmptyRuleGroup(logicalOperator);
      const newConditions = [...group.conditions, newChild];
      const newGroup: RuleGroup = { ...group, conditions: newConditions };
      onChange(setGroupAt(value, groupPath, newGroup));
    },
    [value, onChange],
  );

  const updateCondition = useCallback(
    (
      groupPath: GroupPath,
      conditionIndex: number,
      condition: Rule | RuleGroup,
    ) => {
      const group = getGroupAt(value, groupPath);
      const newConditions = [...group.conditions];
      newConditions[conditionIndex] = condition;
      const newGroup: RuleGroup = { ...group, conditions: newConditions };
      onChange(setGroupAt(value, groupPath, newGroup));
    },
    [value, onChange],
  );

  const removeCondition = useCallback(
    (groupPath: GroupPath, conditionIndex: number) => {
      const group = getGroupAt(value, groupPath);
      const newConditions = group.conditions.filter((_, i) => i !== conditionIndex);
      const newGroup: RuleGroup = { ...group, conditions: newConditions };
      onChange(setGroupAt(value, groupPath, newGroup));
    },
    [value, onChange],
  );

  const setLogicalOperator = useCallback(
    (groupPath: GroupPath, op: LogicalOperator) => {
      const group = getGroupAt(value, groupPath);
      const newGroup: RuleGroup = { ...group, logicalOperator: op };
      onChange(setGroupAt(value, groupPath, newGroup));
    },
    [value, onChange],
  );

  return {
    addRule,
    addGroup,
    updateCondition,
    removeCondition,
    setLogicalOperator,
    getGroupAt,
  };
}
