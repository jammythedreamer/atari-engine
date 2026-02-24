import { useMemo } from "react";
import { mergeLabels } from "../utils/defaults";
import { buildValidationErrorsMap } from "../utils/validation";
import type { RuleBuilderProps } from "../types";
import { RuleBuilderContext } from "../context";
import { RuleGroupEditor } from "./RuleGroupEditor";

export function RuleBuilder({
  value,
  onChange,
  fields,
  labels: labelsOverride,
  showValidation = false,
  maxDepth = 0,
  className,
  theme,
}: RuleBuilderProps) {
  const labels = useMemo(
    () => mergeLabels(labelsOverride),
    [labelsOverride],
  );

  const validationErrors = useMemo(
    () => (showValidation ? buildValidationErrorsMap(value) : new Map<string, string[]>()),
    [showValidation, value],
  );

  const contextValue = useMemo(
    () => ({
      fields,
      labels,
      showValidation,
      maxDepth,
      validationErrors,
    }),
    [fields, labels, showValidation, maxDepth, validationErrors],
  );

  return (
    <RuleBuilderContext.Provider value={contextValue}>
      <div
        className={["atari-ruleBuilder", className].filter(Boolean).join(" ")}
        data-theme={theme === "dark" ? "dark" : undefined}
      >
        <RuleGroupEditor
          value={value}
          onChange={onChange}
          groupPath={[]}
        />
      </div>
    </RuleBuilderContext.Provider>
  );
}
