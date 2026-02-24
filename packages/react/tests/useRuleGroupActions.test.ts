import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRuleGroupActions, createDefaultRule } from "../src/hooks/useRuleGroupActions";
import { createEmptyRuleGroup } from "../src/utils/defaults";
import { isRule, isRuleGroup } from "@atari-engine/core";

describe("useRuleGroupActions", () => {
  it("addRule at root updates value", () => {
    const value = createEmptyRuleGroup("AND");
    const onChange = vi.fn();
    const { result } = renderHook(() => useRuleGroupActions(value, onChange));

    act(() => {
      result.current.addRule([]);
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0];
    expect(next.conditions).toHaveLength(1);
    expect(isRule(next.conditions[0])).toBe(true);
  });

  it("addGroup then addRule at path [0] produces correct nested structure", () => {
    const value = createEmptyRuleGroup("AND");
    const onChange = vi.fn();
    const { result } = renderHook(() => useRuleGroupActions(value, onChange));

    act(() => {
      result.current.addGroup([]);
    });
    const afterGroup = onChange.mock.calls[onChange.mock.calls.length - 1][0];

    const { result: result2 } = renderHook(() =>
      useRuleGroupActions(afterGroup, onChange),
    );
    act(() => {
      result2.current.addRule([0]);
    });

    const final = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(isRuleGroup(final.conditions[0])).toBe(true);
    const inner = final.conditions[0];
    if (!isRuleGroup(inner)) throw new Error("expected group");
    expect(inner.conditions).toHaveLength(1);
    expect(isRule(inner.conditions[0])).toBe(true);
  });

  it("depth 2: addGroup([]), addGroup([0]), addRule([0,0]) preserves structure", () => {
    let value = createEmptyRuleGroup("AND");
    const onChange = vi.fn((next: typeof value) => {
      value = next;
    });

    const { result } = renderHook(() => useRuleGroupActions(value, onChange));

    act(() => {
      result.current.addGroup([]);
    });
    expect(value.conditions).toHaveLength(1);
    expect(isRuleGroup(value.conditions[0])).toBe(true);

    const { result: r2 } = renderHook(() => useRuleGroupActions(value, onChange));
    act(() => {
      r2.current.addGroup([0]);
    });
    const inner0 = value.conditions[0];
    if (!isRuleGroup(inner0)) throw new Error("expected group");
    expect(inner0.conditions).toHaveLength(1);
    expect(isRuleGroup(inner0.conditions[0])).toBe(true);

    const { result: r3 } = renderHook(() => useRuleGroupActions(value, onChange));
    act(() => {
      r3.current.addRule([0, 0]);
    });
    const inner00 = (value.conditions[0] as { conditions: unknown[] }).conditions[0];
    const innerGroup = inner00 as { conditions: unknown[] };
    expect(innerGroup.conditions).toHaveLength(1);
    expect(isRule(innerGroup.conditions[0])).toBe(true);
  });

  it("setLogicalOperator toggles AND/OR", () => {
    const value = createEmptyRuleGroup("AND");
    const onChange = vi.fn();
    const { result } = renderHook(() => useRuleGroupActions(value, onChange));

    act(() => {
      result.current.setLogicalOperator([], "OR");
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ logicalOperator: "OR" }),
    );
  });

  it("removeCondition removes rule at index", () => {
    const rule = createDefaultRule();
    const value = {
      logicalOperator: "AND" as const,
      conditions: [rule],
    };
    const onChange = vi.fn();
    const { result } = renderHook(() => useRuleGroupActions(value, onChange));

    act(() => {
      result.current.removeCondition([], 0);
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ conditions: [] }),
    );
  });
});
