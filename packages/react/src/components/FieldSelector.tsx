import { FIELD_TYPES } from "@atari-engine/core";
import type { FieldType } from "../types";
import { useRuleBuilderContext } from "../context";

const FIELD_TYPE_OPTIONS: { value: FieldType; label: string }[] = [
  { value: FIELD_TYPES.STRING, label: "String" },
  { value: FIELD_TYPES.NUMBER, label: "Number" },
  { value: FIELD_TYPES.BOOLEAN, label: "Boolean" },
  { value: FIELD_TYPES.DATE, label: "Date" },
  { value: FIELD_TYPES.DATE_UNIX, label: "Date (Unix)" },
];

export interface FieldSelectorProps {
  fieldName: string;
  fieldType: FieldType;
  onChange: (fieldName: string, fieldType: FieldType) => void;
  error?: string;
}

export function FieldSelector({
  fieldName,
  fieldType,
  onChange,
  error,
}: FieldSelectorProps) {
  const { fields, labels } = useRuleBuilderContext();
  const hasFields = fields && fields.length > 0;

  return (
    <div className="atari-fieldSelector">
      {hasFields ? (
        <select
          className="atari-fieldSelector-select atari-input"
          value={fieldName}
          onChange={(e) => {
            const f = fields.find((x) => x.name === e.target.value);
            if (f) onChange(f.name, f.type);
          }}
          aria-label="Field"
        >
          <option value="">{labels.fieldPlaceholder}</option>
          {fields!.map((f) => (
            <option key={f.name} value={f.name}>
              {f.label ?? f.name}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          className="atari-fieldSelector-input atari-input"
          value={fieldName}
          onChange={(e) => onChange(e.target.value, fieldType)}
          placeholder={labels.fieldPlaceholder}
          aria-label="Field name"
        />
      )}
      {!hasFields && (
        <select
          className="atari-fieldSelector-type atari-input"
          value={fieldType}
          onChange={(e) =>
            onChange(fieldName, e.target.value as FieldType)
          }
          aria-label="Field type"
        >
          {FIELD_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
      {error && <span className="atari-fieldSelector-error">{error}</span>}
    </div>
  );
}
