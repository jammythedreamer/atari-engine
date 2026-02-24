import { useState } from "react";
import {
  RuleBuilder,
  createEmptyRuleGroup,
  type RuleGroup,
  type FieldDefinition,
} from "@atari-engine/react";

const DEMO_FIELDS: FieldDefinition[] = [
  { name: "name", type: "string", label: "Name" },
  { name: "age", type: "number", label: "Age" },
  { name: "active", type: "boolean", label: "Active" },
  { name: "createdAt", type: "date", label: "Created At" },
];

export default function App() {
  const [value, setValue] = useState<RuleGroup>(() =>
    createEmptyRuleGroup("AND"),
  );
  const [showValidation, setShowValidation] = useState(false);
  const [maxDepth, setMaxDepth] = useState(3);
  const [darkMode, setDarkMode] = useState(false);

  const pageStyles = {
    padding: 24,
    maxWidth: 900,
    margin: "0 auto" as const,
    minHeight: "100vh",
    ...(darkMode && {
      background: "#111827",
      color: "#f9fafb",
    }),
  };

  return (
    <div style={pageStyles}>
      <h1 style={{ marginBottom: 8 }}>@atari-engine/react Playground</h1>
      <p style={{ color: darkMode ? "#9ca3af" : "#666", marginBottom: 24 }}>
        RuleBuilder usage test. Toggle options and edit rules below.
      </p>

      <div style={{ marginBottom: 24, display: "flex", gap: 24, flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
          />
          Dark mode
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={showValidation}
            onChange={(e) => setShowValidation(e.target.checked)}
          />
          Show validation
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          Max depth:
          <input
            type="number"
            min={0}
            max={10}
            value={maxDepth}
            onChange={(e) => setMaxDepth(Number(e.target.value) || 0)}
            style={{ width: 56, marginLeft: 4 }}
          />
        </label>
      </div>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>RuleBuilder</h2>
        <RuleBuilder
          value={value}
          onChange={setValue}
          fields={DEMO_FIELDS}
          showValidation={showValidation}
          maxDepth={maxDepth}
          theme={darkMode ? "dark" : undefined}
        />
      </section>

      <section>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Current value (JSON)</h2>
        <pre
          style={{
            background: darkMode ? "#1f2937" : "#f5f5f5",
            color: darkMode ? "#f9fafb" : undefined,
            padding: 16,
            borderRadius: 8,
            overflow: "auto",
            fontSize: 12,
          }}
        >
          {JSON.stringify(value, null, 2)}
        </pre>
      </section>
    </div>
  );
}
