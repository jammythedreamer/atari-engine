import type {
  FieldType,
  LogicalOperator,
  Operator,
  Rule,
  RuleGroup,
  RuleValue,
} from "@atari-engine/core";

export type { FieldType, LogicalOperator, Operator, Rule, RuleGroup, RuleValue };

export interface FieldDefinition {
  name: string;
  type: FieldType;
  label?: string;
}

export interface RuleBuilderLabels {
  addRule: string;
  addGroup: string;
  removeRule: string;
  removeGroup: string;
  fieldPlaceholder: string;
  valuePlaceholder: string;
  logicalAnd: string;
  logicalOr: string;
}

export interface RuleBuilderProps {
  value: RuleGroup;
  onChange: (value: RuleGroup) => void;
  fields?: FieldDefinition[];
  labels?: Partial<RuleBuilderLabels>;
  showValidation?: boolean;
  maxDepth?: number;
  className?: string;
  theme?: "light" | "dark";
}

export interface RuleBuilderContextValue {
  fields: FieldDefinition[] | undefined;
  labels: RuleBuilderLabels;
  showValidation: boolean;
  maxDepth: number;
  validationErrors: Map<string, string[]>;
}
