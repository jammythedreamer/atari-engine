import type { FieldType, Operator } from "../types";
import { getOperatorsForFieldType } from "../utils/operators";

const OPERATOR_LABELS: Record<string, string> = {
  "==": "equals",
  "!=": "not equals",
  ">": "greater than",
  ">=": "greater or equal",
  "<": "less than",
  "<=": "less or equal",
  in: "in",
  not_in: "not in",
  contains: "contains",
  not_contains: "not contains",
  starts_with: "starts with",
  ends_with: "ends with",
  exists: "exists",
  not_exists: "not exists",
};

export interface OperatorSelectorProps {
  fieldType: FieldType;
  operator: Operator;
  onChange: (operator: Operator) => void;
  error?: string;
}

export function OperatorSelector({
  fieldType,
  operator,
  onChange,
  error,
}: OperatorSelectorProps) {
  const options = getOperatorsForFieldType(fieldType);

  return (
    <div className="atari-operatorSelector">
      <select
        className="atari-operatorSelector-select atari-input"
        value={operator}
        onChange={(e) => onChange(e.target.value as Operator)}
        aria-label="Operator"
      >
        {options.map((op) => (
          <option key={op} value={op}>
            {OPERATOR_LABELS[op] ?? op}
          </option>
        ))}
      </select>
      {error && <span className="atari-operatorSelector-error">{error}</span>}
    </div>
  );
}
