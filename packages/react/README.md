# @atari-engine/react

React components for building and editing Atari rule groups. Part of the [atari-engine](https://github.com/jammythedreamer/atari-engine) monorepo.

## Installation

```bash
pnpm add @atari-engine/react @atari-engine/core react react-dom
```

Or with npm:

```bash
npm install @atari-engine/react @atari-engine/core react react-dom
```

## Peer dependencies

- `react` >= 18.0.0
- `react-dom` >= 18.0.0 (optional in non-DOM environments)

## Usage

1. Import the component and styles in your app:

```tsx
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

2. Optional: use `data-theme="dark"` on the wrapper for dark mode, or rely on `prefers-color-scheme: dark`:

```tsx
<div className="atari-ruleBuilder" data-theme="dark">
  <RuleBuilder value={value} onChange={setValue} />
</div>
```

## Props (RuleBuilderProps)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `RuleGroup` | required | Current rule group tree (controlled). |
| `onChange` | `(value: RuleGroup) => void` | required | Called when the user changes the tree. |
| `fields` | `FieldDefinition[]` | `undefined` | Field definitions for dropdown selection; if omitted, users type field names and pick a type. |
| `labels` | `Partial<RuleBuilderLabels>` | `{}` | Override default button/label text. |
| `showValidation` | `boolean` | `false` | When true, validation errors from `@atari-engine/core` are shown per rule. |
| `maxDepth` | `number` | `0` | Max nesting depth for groups; `0` = unlimited. |
| `className` | `string` | `undefined` | Extra class name for the root wrapper. |

## Exports

- **Components:** `RuleBuilder`, `RuleGroupEditor`, `RuleEditor`, `FieldSelector`, `OperatorSelector`, `ValueEditor`, `ActionBar`
- **Hooks:** `useRuleBuilderContext`, `useRuleGroupActions`
- **Utilities:** `createEmptyRuleGroup`, `createDefaultRule`, `mergeLabels`, `getConditionKey`, `getOperatorsForFieldType`, `DEFAULT_LABELS`, `OPERATORS`
- **Types:** `RuleGroup`, `Rule`, `FieldType`, `Operator`, `LogicalOperator`, `RuleValue`, `FieldDefinition`, `RuleBuilderLabels`, `RuleBuilderProps`, `RuleBuilderContextValue`, `GroupPath`, and component prop types (`RuleGroupEditorProps`, `RuleEditorProps`, etc.)

## Styling

Import the default styles:

```tsx
import "@atari-engine/react/styles.css";
```

Themes are controlled via CSS custom properties on `.atari-ruleBuilder` (e.g. `--atari-bg`, `--atari-primary`, `--atari-focus-ring`). Light and dark values are set in the bundle; dark mode applies automatically with `prefers-color-scheme: dark` or when `data-theme="dark"` is set on the root.

## License

MIT
