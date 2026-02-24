import { createContext, useContext } from "react";
import type { RuleBuilderContextValue } from "./types";

export const RuleBuilderContext =
  createContext<RuleBuilderContextValue | null>(null);

export function useRuleBuilderContext(): RuleBuilderContextValue {
  const ctx = useContext(RuleBuilderContext);
  if (!ctx) {
    throw new Error(
      "RuleBuilder components must be used within a RuleBuilder provider",
    );
  }
  return ctx;
}
