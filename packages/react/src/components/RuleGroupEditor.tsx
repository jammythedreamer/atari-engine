import { isRule, isRuleGroup } from "@atari-engine/core";
import type { RuleGroup } from "../types";
import { useRuleBuilderContext } from "../context";
import { useRuleGroupActions } from "../hooks/useRuleGroupActions";
import type { GroupPath } from "../hooks/useRuleGroupActions";
import { getConditionKey } from "../utils/defaults";
import { pathForCondition } from "../utils/validation";
import { RuleEditor } from "./RuleEditor";
import { ActionBar } from "./ActionBar";

export interface RuleGroupEditorProps {
  value: RuleGroup;
  onChange: (value: RuleGroup) => void;
  groupPath: GroupPath;
  depth?: number;
}

export function RuleGroupEditor({
  value,
  onChange,
  groupPath,
  depth = 0,
}: RuleGroupEditorProps) {
  const { labels, maxDepth, showValidation, validationErrors } =
    useRuleBuilderContext();
  const {
    addRule,
    addGroup,
    updateCondition,
    removeCondition,
    setLogicalOperator,
    getGroupAt,
  } = useRuleGroupActions(value, onChange);

  const group = getGroupAt(value, groupPath);
  const canAddGroup = maxDepth <= 0 || depth < maxDepth - 1;

  return (
    <div className="atari-ruleGroupEditor">
      <div className="atari-ruleGroupEditor-header">
        <div
          className="atari-logicalSwitch"
          role="radiogroup"
          aria-label="Logical operator"
        >
          <button
            type="button"
            role="radio"
            aria-checked={group.logicalOperator === "AND"}
            className={`atari-logicalSwitch-btn ${group.logicalOperator === "AND" ? "atari-logicalSwitch-btnActive" : ""}`}
            onClick={() => setLogicalOperator(groupPath, "AND")}
          >
            {labels.logicalAnd}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={group.logicalOperator === "OR"}
            className={`atari-logicalSwitch-btn ${group.logicalOperator === "OR" ? "atari-logicalSwitch-btnActive" : ""}`}
            onClick={() => setLogicalOperator(groupPath, "OR")}
          >
            {labels.logicalOr}
          </button>
        </div>
      </div>
      <div className="atari-ruleGroupEditor-conditions">
        {group.conditions.map((condition, index) => (
          <div
            key={getConditionKey(condition, groupPath, index)}
            className="atari-ruleGroupEditor-condition"
          >
            {isRule(condition) ? (
              <RuleEditor
                rule={condition}
                onUpdate={(rule) =>
                  updateCondition(groupPath, index, rule)
                }
                onRemove={() => removeCondition(groupPath, index)}
                error={
                  showValidation
                    ? validationErrors
                        .get(pathForCondition(groupPath, index))
                        ?.join("; ")
                    : undefined
                }
                removeRuleAriaLabel={`${labels.removeRule} ${index + 1}`}
              />
            ) : isRuleGroup(condition) ? (
              <div className="atari-ruleGroupEditor-nested">
                <button
                  type="button"
                  className="atari-ruleGroupEditor-removeGroup"
                  onClick={() =>
                    removeCondition(groupPath, index)
                  }
                  aria-label={`${labels.removeGroup} ${index + 1}`}
                >
                  {labels.removeGroup}
                </button>
                <RuleGroupEditor
                  value={value}
                  onChange={onChange}
                  groupPath={[...groupPath, index]}
                  depth={depth + 1}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <ActionBar
        onAddRule={() => addRule(groupPath)}
        onAddGroup={() => addGroup(groupPath)}
        canAddGroup={canAddGroup}
      />
    </div>
  );
}
