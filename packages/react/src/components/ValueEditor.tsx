import { useState } from "react";
import { OPERATORS } from "@atari-engine/core";
import type { FieldType, Operator, RuleValue } from "../types";
import { useRuleBuilderContext } from "../context";

export interface ValueEditorProps {
  fieldType: FieldType;
  operator: Operator;
  value: RuleValue;
  onChange: (value: RuleValue) => void;
  error?: string;
}

function commitChipValue(
  raw: string,
  fieldType: FieldType,
  base: (string | number)[],
  onChange: (value: RuleValue) => void,
): void {
  const trimmed = raw.trim();
  if (!trimmed) return;
  if (fieldType === "number") {
    const num = Number(trimmed);
    if (!Number.isNaN(num)) onChange([...base, num] as RuleValue);
  } else {
    onChange([...base, trimmed] as RuleValue);
  }
}

export function ValueEditor({
  fieldType,
  operator,
  value,
  onChange,
  error,
}: ValueEditorProps) {
  const { labels } = useRuleBuilderContext();
  const [chipInput, setChipInput] = useState("");

  if (operator === OPERATORS.EXISTS || operator === OPERATORS.NOT_EXISTS) {
    return null;
  }

  const isArrayOp =
    operator === OPERATORS.IN || operator === OPERATORS.NOT_IN;
  const arr = isArrayOp
    ? (Array.isArray(value) ? value : [])
    : null;
  const base: (string | number)[] = isArrayOp ? (Array.isArray(value) ? (value as (string | number)[]) : []) : [];

  const removeArrayItem = (index: number) => {
    onChange(base.filter((_, i) => i !== index) as RuleValue);
  };

  const addChip = (raw: string) => {
    commitChipValue(raw, fieldType, base, onChange);
    setChipInput("");
  };

  if (isArrayOp) {
    return (
      <div className="atari-valueEditor atari-valueEditor-chipField">
        <div className="atari-valueEditor-chipWrap">
          {arr?.map((item, i) => (
            <button
              key={i}
              type="button"
              className="atari-valueEditor-chip"
              onClick={() => removeArrayItem(i)}
              aria-label={`Remove ${item}`}
            >
              {String(item)}
            </button>
          ))}
          <input
            type={fieldType === "number" ? "number" : "text"}
            className="atari-valueEditor-chipInput"
            value={chipInput}
            onChange={(e) => setChipInput(e.target.value)}
            placeholder={arr && arr.length > 0 ? "" : labels.valuePlaceholder}
            aria-label="Add value"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addChip(e.currentTarget.value);
              }
              if (
                e.key === "Backspace" &&
                chipInput === "" &&
                arr &&
                arr.length > 0
              ) {
                removeArrayItem(arr.length - 1);
              }
            }}
            onBlur={(e) => {
              const raw = e.currentTarget.value;
              if (raw.trim()) addChip(raw);
            }}
          />
        </div>
        {error && (
          <span className="atari-valueEditor-error" aria-live="polite">{error}</span>
        )}
      </div>
    );
  }

  if (fieldType === "boolean") {
    return (
      <div className="atari-valueEditor">
        <select
          className="atari-input atari-valueEditor-select"
          value={String(value)}
          onChange={(e) =>
            onChange(e.target.value === "true")
          }
          aria-label="Value"
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
        {error && (
          <span className="atari-valueEditor-error" aria-live="polite">{error}</span>
        )}
      </div>
    );
  }

  if (fieldType === "number" || fieldType === "date_unix") {
    return (
      <div className="atari-valueEditor">
        <input
          type="number"
          className="atari-input atari-valueEditor-input"
          value={value === null || value === undefined ? "" : Number(value)}
          onChange={(e) =>
            onChange(
              e.target.value === ""
                ? null
                : (e.target.valueAsNumber ?? 0),
            )
          }
          placeholder={labels.valuePlaceholder}
          aria-label="Value"
        />
        {error && (
          <span className="atari-valueEditor-error" aria-live="polite">{error}</span>
        )}
      </div>
    );
  }

  if (fieldType === "date") {
    const iso =
      typeof value === "string" && value
        ? value.slice(0, 10)
        : "";
    return (
      <div className="atari-valueEditor">
        <input
          type="date"
          className="atari-input atari-valueEditor-input"
          value={iso}
          onChange={(e) =>
            onChange(e.target.value ? e.target.value : null)
          }
          aria-label="Value"
        />
        {error && (
          <span className="atari-valueEditor-error" aria-live="polite">{error}</span>
        )}
      </div>
    );
  }

  return (
    <div className="atari-valueEditor">
      <input
        type="text"
        className="atari-input atari-valueEditor-input"
        value={value === null || value === undefined ? "" : String(value)}
        onChange={(e) => onChange(e.target.value || null)}
        placeholder={labels.valuePlaceholder}
        aria-label="Value"
      />
      {error && (
        <span className="atari-valueEditor-error" aria-live="polite">{error}</span>
      )}
    </div>
  );
}
