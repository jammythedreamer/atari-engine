import {
  isOperatorAllowedForFieldType,
  OPERATORS,
  type FieldType,
  type Operator,
} from "@atari-engine/core";

export { OPERATORS };

export function getOperatorsForFieldType(fieldType: FieldType): Operator[] {
  return (Object.keys(OPERATORS) as (keyof typeof OPERATORS)[])
    .map((k) => OPERATORS[k])
    .filter((op) => isOperatorAllowedForFieldType(op, fieldType));
}
