import type { Rule } from "../types";
import { FieldSelector } from "./FieldSelector";
import { OperatorSelector } from "./OperatorSelector";
import { ValueEditor } from "./ValueEditor";

export interface RuleEditorProps {
  rule: Rule;
  onUpdate: (rule: Rule) => void;
  onRemove: () => void;
  error?: string;
  removeRuleAriaLabel?: string;
}

export function RuleEditor({
  rule,
  onUpdate,
  onRemove,
  error,
  removeRuleAriaLabel = "Remove rule",
}: RuleEditorProps) {
  return (
    <div className="atari-ruleEditor">
      <FieldSelector
        fieldName={rule.fieldName}
        fieldType={rule.fieldType}
        onChange={(fieldName, fieldType) =>
          onUpdate({ ...rule, fieldName, fieldType })
        }
      />
      <OperatorSelector
        fieldType={rule.fieldType}
        operator={rule.operator}
        onChange={(operator) => onUpdate({ ...rule, operator })}
      />
      <ValueEditor
        fieldType={rule.fieldType}
        operator={rule.operator}
        value={rule.value}
        onChange={(value) => onUpdate({ ...rule, value })}
      />
      <button
        type="button"
        className="atari-ruleEditor-remove"
        onClick={onRemove}
        aria-label={removeRuleAriaLabel}
      >
        ×
      </button>
      {error && (
        <div className="atari-ruleEditor-error" aria-live="polite">
          {error}
        </div>
      )}
    </div>
  );
}
