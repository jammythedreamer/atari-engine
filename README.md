# atari-engine

Lightweight rule evaluation engine for A/B testing, feature flags, and user targeting.

[![@atari-engine/core](https://img.shields.io/npm/v/@atari-engine/core.svg?label=%40atari-engine%2Fcore)](https://www.npmjs.com/package/@atari-engine/core)
[![@atari-engine/react](https://img.shields.io/npm/v/@atari-engine/react.svg?label=%40atari-engine%2Freact)](https://www.npmjs.com/package/@atari-engine/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Highlights

- **Zero runtime dependencies** — `@atari-engine/core` has no external dependencies for minimal bundle size and cold starts.
- **Edge-native** — Runs on Cloudflare Workers, Node.js, and in the browser.
- **Infinite nesting** — AND/OR rule groups with arbitrary depth.
- **Type-safe** — Full TypeScript support and type definitions.
- **Isomorphic** — Same code and behavior across all supported environments.
- **React Rule Builder** — Optional UI components with dark mode and validation.

## Packages

This monorepo publishes two packages:

| Package | Description |
|---------|-------------|
| [@atari-engine/core](packages/core/README.md) | Rule evaluation engine: `evaluate()`, `validate()`, and shared types. |
| [@atari-engine/react](packages/react/README.md) | React Rule Builder UI for creating and editing rule groups. |

## Quick Start — Core

Install the core engine:

```bash
npm install @atari-engine/core
# or
pnpm add @atari-engine/core
# or
yarn add @atari-engine/core
```

Define a rule, validate it, and evaluate against context:

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

## Quick Start — React

Install the React package and peer dependencies:

```bash
npm install @atari-engine/react @atari-engine/core react react-dom
# or
pnpm add @atari-engine/react @atari-engine/core react react-dom
```

Use the Rule Builder in your app:

```tsx
import { useState } from "react";
import { RuleBuilder, createEmptyRuleGroup } from "@atari-engine/react";
import "@atari-engine/react/styles.css";

function App() {
  const [value, setValue] = useState(() => createEmptyRuleGroup("AND"));

  return (
    <RuleBuilder
      value={value}
      onChange={setValue}
      fields={[
        { name: "age", type: "number", label: "Age" },
        { name: "country", type: "string", label: "Country" },
      ]}
      showValidation
    />
  );
}
```

For dark mode, set `data-theme="dark"` on the wrapper or rely on `prefers-color-scheme: dark`.

## Compatibility

| Environment | Supported |
|-------------|-----------|
| Cloudflare Workers | Yes (primary target) |
| Node.js >= 18 | Yes |
| Browser (ES2022+) | Yes |
| Deno / Bun | Yes (ESM) |

## Documentation

- [@atari-engine/core API and usage](packages/core/README.md)
- [@atari-engine/react components and props](packages/react/README.md)

## Feedback

Issues and feedback are welcome.

## License

MIT © JammyTheDreamer
