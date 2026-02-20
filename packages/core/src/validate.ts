import { isOperatorAllowedForFieldType } from "./operators.js";
import type {
  FieldType,
  Operator,
  Rule,
  RuleGroup,
  ValidationError,
  ValidationResult,
} from "./types.js";
import { FIELD_TYPES, isRule, isRuleGroup, OPERATORS } from "./types.js";

function validateRuleValue(
  value: unknown,
  fieldType: FieldType,
  operator: Operator,
  path: string,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (operator === OPERATORS.EXISTS || operator === OPERATORS.NOT_EXISTS) {
    return errors;
  }
  if (operator === OPERATORS.IN || operator === OPERATORS.NOT_IN) {
    if (!Array.isArray(value)) {
      errors.push({
        path,
        message: "Value must be an array for IN/NOT_IN operator",
      });
      return errors;
    }
    if (fieldType === FIELD_TYPES.NUMBER) {
      if (!value.every((v) => typeof v === "number")) {
        errors.push({
          path,
          message: "IN/NOT_IN value must be number[] for fieldType number",
        });
      }
    } else if (fieldType === FIELD_TYPES.STRING) {
      if (!value.every((v) => typeof v === "string")) {
        errors.push({
          path,
          message: "IN/NOT_IN value must be string[] for fieldType string",
        });
      }
    }
    return errors;
  }
  switch (fieldType) {
    case FIELD_TYPES.NUMBER:
      if (typeof value !== "number") {
        errors.push({
          path,
          message: "Value must be number for fieldType number",
        });
      }
      break;
    case FIELD_TYPES.STRING:
      if (typeof value !== "string") {
        errors.push({
          path,
          message: "Value must be string for fieldType string",
        });
      }
      break;
    case FIELD_TYPES.BOOLEAN:
      if (typeof value !== "boolean") {
        errors.push({
          path,
          message: "Value must be boolean for fieldType boolean",
        });
      }
      break;
    case FIELD_TYPES.DATE:
      if (typeof value !== "string") {
        errors.push({
          path,
          message: "Value must be string (ISO date) for fieldType date",
        });
      } else if (Number.isNaN(new Date(value as string).getTime())) {
        errors.push({
          path,
          message: "Value must be a valid ISO date string for fieldType date",
        });
      }
      break;
    case FIELD_TYPES.DATE_UNIX:
      if (typeof value !== "number") {
        errors.push({
          path,
          message: "Value must be number for fieldType date_unix",
        });
      }
      break;
  }
  return errors;
}

function validateNode(node: Rule | RuleGroup, path: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (isRuleGroup(node)) {
    if (node.conditions.length === 0) {
      errors.push({
        path: path || "conditions",
        message: "RuleGroup must have at least one condition",
      });
    } else {
      for (let i = 0; i < node.conditions.length; i++) {
        const child = node.conditions[i];
        const childPath = path
          ? `${path}.conditions[${i}]`
          : `conditions[${i}]`;
        if (!isRule(child) && !isRuleGroup(child)) {
          errors.push({
            path: childPath,
            message: "Condition must be a Rule or RuleGroup",
          });
        } else {
          errors.push(...validateNode(child, childPath));
        }
      }
    }
    return errors;
  }

  if (isRule(node)) {
    if (!node.fieldName || typeof node.fieldName !== "string") {
      errors.push({ path, message: "Rule must have a non-empty fieldName" });
    }
    if (!node.fieldType || typeof node.fieldType !== "string") {
      errors.push({ path, message: "Rule must have a fieldType" });
    }
    if (!node.operator || typeof node.operator !== "string") {
      errors.push({ path, message: "Rule must have an operator" });
    }
    const validFieldTypes: FieldType[] = [
      FIELD_TYPES.STRING,
      FIELD_TYPES.NUMBER,
      FIELD_TYPES.BOOLEAN,
      FIELD_TYPES.DATE,
      FIELD_TYPES.DATE_UNIX,
    ];
    if (
      node.fieldType &&
      !validFieldTypes.includes(node.fieldType as FieldType)
    ) {
      errors.push({
        path,
        message: `Invalid fieldType: ${node.fieldType}`,
      });
    }
    if (
      node.operator &&
      node.fieldType &&
      !isOperatorAllowedForFieldType(
        node.operator as Operator,
        node.fieldType as FieldType,
      )
    ) {
      errors.push({
        path,
        message: `Operator '${node.operator}' is not allowed for fieldType '${node.fieldType}'`,
      });
    }
    if (
      node.operator !== OPERATORS.EXISTS &&
      node.operator !== OPERATORS.NOT_EXISTS
    ) {
      if (node.value === undefined) {
        errors.push({
          path,
          message: "Rule must have a value (except for EXISTS/NOT_EXISTS)",
        });
      }
    }
    if (
      node.fieldType &&
      node.operator &&
      validFieldTypes.includes(node.fieldType as FieldType)
    ) {
      errors.push(
        ...validateRuleValue(
          node.value,
          node.fieldType as FieldType,
          node.operator as Operator,
          path,
        ),
      );
    }
    return errors;
  }

  errors.push({
    path,
    message: "Invalid rule node: must be Rule or RuleGroup",
  });
  return errors;
}

export function validate(rule: Rule | RuleGroup): ValidationResult {
  if (!rule || typeof rule !== "object") {
    return {
      valid: false,
      errors: [{ path: "", message: "Rule must be a non-null object" }],
    };
  }
  const errors = validateNode(rule, "");
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  return { valid: true };
}
