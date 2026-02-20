import { AtariError, ATARI_ERROR_CODES } from "./errors.js";
import { isOperatorAllowedForFieldType } from "./operators.js";
import type {
  EvaluateOptions,
  Rule,
  RuleGroup,
  UserProperties,
} from "./types.js";
import {
  FIELD_TYPES,
  isRule,
  isRuleGroup,
  LOGICAL_OPERATORS,
  OPERATORS,
} from "./types.js";
import { coerceToComparable, getNestedValue } from "./utils.js";

function emit(options: EvaluateOptions | undefined, error: AtariError): void {
  options?.onError?.(error);
}

function evaluateRule(
  rule: Rule,
  context: UserProperties,
  options: EvaluateOptions | undefined,
): boolean {
  const raw = getNestedValue(context, rule.fieldName);

  if (rule.operator === OPERATORS.EXISTS) {
    return raw !== undefined;
  }
  if (rule.operator === OPERATORS.NOT_EXISTS) {
    return raw === undefined;
  }

  if (raw === undefined) {
    emit(
      options,
      new AtariError(
        ATARI_ERROR_CODES.FIELD_NOT_FOUND,
        `Field '${rule.fieldName}' not found`,
      ),
    );
    return false;
  }

  if (!isOperatorAllowedForFieldType(rule.operator, rule.fieldType)) {
    emit(
      options,
      new AtariError(
        ATARI_ERROR_CODES.INVALID_OPERATOR,
        `Operator ${rule.operator} not allowed for field type ${rule.fieldType}`,
      ),
    );
    return false;
  }

  const left = coerceToComparable(raw, rule.fieldType);
  if (left === undefined) {
    emit(
      options,
      new AtariError(
        ATARI_ERROR_CODES.TYPE_MISMATCH,
        `Type mismatch for field '${rule.fieldName}'`,
      ),
    );
    return false;
  }

  const value = rule.value;

  let right: unknown = value;
  if (rule.fieldType === FIELD_TYPES.DATE && typeof value === "string") {
    const ms = new Date(value).getTime();
    if (Number.isNaN(ms)) {
      emit(
        options,
        new AtariError(
          ATARI_ERROR_CODES.TYPE_MISMATCH,
          `Invalid date value for field '${rule.fieldName}'`,
        ),
      );
      return false;
    }
    right = ms;
  } else if (
    rule.fieldType === FIELD_TYPES.DATE_UNIX &&
    typeof value === "number"
  ) {
    right = value;
  }

  switch (rule.operator) {
    case OPERATORS.EQUALS:
      return rule.fieldType === FIELD_TYPES.DATE ||
        rule.fieldType === FIELD_TYPES.DATE_UNIX
        ? (left as number) === (right as number)
        : left === value;
    case OPERATORS.NOT_EQUALS:
      return rule.fieldType === FIELD_TYPES.DATE ||
        rule.fieldType === FIELD_TYPES.DATE_UNIX
        ? (left as number) !== (right as number)
        : left !== value;
    case OPERATORS.GREATER_THAN:
      return (left as number) > (right as number);
    case OPERATORS.GREATER_THAN_OR_EQUAL_TO:
      return (left as number) >= (right as number);
    case OPERATORS.LESS_THAN:
      return (left as number) < (right as number);
    case OPERATORS.LESS_THAN_OR_EQUAL_TO:
      return (left as number) <= (right as number);
    case OPERATORS.IN: {
      if (!Array.isArray(value)) {
        emit(
          options,
          new AtariError(
            ATARI_ERROR_CODES.TYPE_MISMATCH,
            `IN operator requires value to be an array for field '${rule.fieldName}'`,
          ),
        );
        return false;
      }
      return (value as unknown[]).includes(left);
    }
    case OPERATORS.NOT_IN: {
      if (!Array.isArray(value)) {
        emit(
          options,
          new AtariError(
            ATARI_ERROR_CODES.TYPE_MISMATCH,
            `NOT_IN operator requires value to be an array for field '${rule.fieldName}'`,
          ),
        );
        return false;
      }
      return !(value as unknown[]).includes(left);
    }
    case OPERATORS.CONTAINS:
      return (
        typeof left === "string" &&
        typeof value === "string" &&
        left.includes(value)
      );
    case OPERATORS.NOT_CONTAINS:
      return (
        typeof left === "string" &&
        typeof value === "string" &&
        !left.includes(value)
      );
    case OPERATORS.STARTS_WITH:
      return (
        typeof left === "string" &&
        typeof value === "string" &&
        left.startsWith(value)
      );
    case OPERATORS.ENDS_WITH:
      return (
        typeof left === "string" &&
        typeof value === "string" &&
        left.endsWith(value)
      );
    default:
      return false;
  }
}

export function evaluate(
  rule: Rule | RuleGroup,
  context: UserProperties,
  options?: EvaluateOptions,
): boolean {
  try {
    if (isRuleGroup(rule)) {
      const { logicalOperator, conditions } = rule;
      if (conditions.length === 0) {
        emit(
          options,
          new AtariError(
            ATARI_ERROR_CODES.EMPTY_CONDITIONS,
            "RuleGroup has empty conditions",
          ),
        );
        return logicalOperator === LOGICAL_OPERATORS.AND;
      }
      const results = conditions.map((c) => evaluate(c, context, options));
      return logicalOperator === LOGICAL_OPERATORS.AND
        ? results.every(Boolean)
        : results.some(Boolean);
    }
    if (isRule(rule)) {
      return evaluateRule(rule, context, options);
    }
    emit(
      options,
      new AtariError(ATARI_ERROR_CODES.INVALID_RULE, "Invalid rule node"),
    );
    return false;
  } catch (err) {
    emit(
      options,
      new AtariError(
        ATARI_ERROR_CODES.INVALID_RULE,
        err instanceof Error ? err.message : String(err),
      ),
    );
    return false;
  }
}
