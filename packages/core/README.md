# @atari-engine/core

Lightweight rule evaluation engine for conditions, feature flags, and user targeting. Define rules with AND/OR groups, validate structure, and evaluate against context (e.g. user properties). Zero runtime dependencies.

## Installation

```bash
npm install @atari-engine/core
# or
pnpm add @atari-engine/core
# or
yarn add @atari-engine/core
```

## Quick Start

```ts
import {
  evaluate,
  validate,
  FIELD_TYPES,
  LOGICAL_OPERATORS,
  OPERATORS,
  type RuleGroup,
  type UserProperties,
} from "@atari-engine/core";

const rule: RuleGroup = {
  logicalOperator: LOGICAL_OPERATORS.AND,
  conditions: [
    {
      fieldName: "age",
      fieldType: FIELD_TYPES.NUMBER,
      operator: OPERATORS.GREATER_THAN_OR_EQUAL_TO,
      value: 18,
    },
    {
      fieldName: "country",
      fieldType: FIELD_TYPES.STRING,
      operator: OPERATORS.IN,
      value: ["KR", "JP", "US"],
    },
  ],
};

const validation = validate(rule);
if (!validation.valid) {
  console.error(validation.errors);
  process.exit(1);
}

const user: UserProperties = { age: 25, country: "KR" };
const matched = evaluate(rule, user);
console.log(matched); // true
```

## API Reference

### `evaluate(rule, context, options?)`

Evaluates a rule or rule group against a context object. Returns `true` if the rule matches, `false` otherwise. Never throws; use `options.onError` to receive validation/runtime errors.

- **rule**: `Rule | RuleGroup` — A single rule or nested AND/OR group.
- **context**: `UserProperties` — Key-value context (e.g. user properties). Supports dot notation for nested keys (e.g. `"address.city"`).
- **options.onError**: `(error: AtariError) => void` — Optional callback for errors (e.g. missing field, type mismatch).

### `validate(rule)`

Validates the structure and types of a rule. Returns `{ valid: true }` or `{ valid: false, errors: ValidationError[] }`.

### Types

- **Rule**: `{ fieldName, fieldType, operator, value }` — Single condition.
- **RuleGroup**: `{ logicalOperator: "AND" | "OR", conditions: (Rule | RuleGroup)[] }` — Nested conditions.
- **FieldType**: `"string" | "number" | "boolean" | "date" | "date_unix"`.
- **Operator**: Equality (`==`, `!=`), comparison (`>`, `>=`, `<`, `<=`), `in` / `not_in`, string (`contains`, `starts_with`, `ends_with`), `exists` / `not_exists`.

### Constants

- **FIELD_TYPES**, **OPERATORS**, **LOGICAL_OPERATORS** — Use these when building rules.
- **OPERATOR_FIELD_TYPE_MATRIX** — Map of which operators are allowed per field type.
- **isOperatorAllowedForFieldType(operator, fieldType)** — Helper for UI/validation.

### Errors

- **AtariError** — Custom error class; `code` has `id` and `category`, `message` for description.
- **ATARI_ERROR_CODES** — `FIELD_NOT_FOUND`, `TYPE_MISMATCH`, `INVALID_OPERATOR`, `INVALID_RULE`, `EMPTY_CONDITIONS`.

## License

MIT © JammyTheDreamer
