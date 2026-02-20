export const FIELD_TYPES = {
  STRING: "string",
  NUMBER: "number",
  BOOLEAN: "boolean",
  DATE: "date",
  DATE_UNIX: "date_unix",
} as const;

export type FieldType = (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES];

export const OPERATORS = {
  EQUALS: "==",
  NOT_EQUALS: "!=",
  GREATER_THAN: ">",
  GREATER_THAN_OR_EQUAL_TO: ">=",
  LESS_THAN: "<",
  LESS_THAN_OR_EQUAL_TO: "<=",
  IN: "in",
  NOT_IN: "not_in",
  CONTAINS: "contains",
  NOT_CONTAINS: "not_contains",
  STARTS_WITH: "starts_with",
  ENDS_WITH: "ends_with",
  EXISTS: "exists",
  NOT_EXISTS: "not_exists",
} as const;

export type Operator = (typeof OPERATORS)[keyof typeof OPERATORS];

export const LOGICAL_OPERATORS = {
  AND: "AND",
  OR: "OR",
} as const;

export type LogicalOperator =
  (typeof LOGICAL_OPERATORS)[keyof typeof LOGICAL_OPERATORS];

export type RuleValue = string | number | boolean | null | string[] | number[];

export interface Rule {
  fieldName: string;
  fieldType: FieldType;
  operator: Operator;
  value: RuleValue;
}

export interface RuleGroup {
  logicalOperator: LogicalOperator;
  conditions: (Rule | RuleGroup)[];
}

export type UserProperties = {
  [key: string]: RuleValue | UserProperties;
};

export interface ValidationError {
  path: string;
  message: string;
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: ValidationError[] };

import type { AtariError } from "./errors";

export interface EvaluateOptions {
  onError?: (error: AtariError) => void;
}

export function isRuleGroup(node: Rule | RuleGroup): node is RuleGroup {
  return "logicalOperator" in node && "conditions" in node;
}

export function isRule(node: Rule | RuleGroup): node is Rule {
  return "fieldName" in node && "fieldType" in node && "operator" in node;
}
