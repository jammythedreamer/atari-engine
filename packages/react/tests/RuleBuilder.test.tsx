import { describe, expect, it, vi } from "vitest";
import { render, fireEvent, within } from "@testing-library/react";
import {
  RuleBuilder,
  createEmptyRuleGroup,
  createDefaultRule,
} from "../src/index.js";
import { isRule, isRuleGroup } from "@atari-engine/core";

function getWithin(container: HTMLElement) {
  return within(container);
}

describe("RuleBuilder", () => {
  it("renders empty group with Add Rule and Add Group buttons", () => {
    const value = createEmptyRuleGroup("AND");
    const { container } = render(
      <RuleBuilder value={value} onChange={() => {}} />,
    );
    const w = getWithin(container);

    expect(w.getByRole("button", { name: /add rule/i })).toBeInTheDocument();
    expect(w.getByRole("button", { name: /add group/i })).toBeInTheDocument();
    expect(w.getByRole("radio", { name: /^AND$/i })).toBeInTheDocument();
    expect(w.getByRole("radio", { name: /^OR$/i })).toBeInTheDocument();
  });

  it("calls onChange when Add Rule is clicked", () => {
    const value = createEmptyRuleGroup("AND");
    const onChange = vi.fn();
    const { container } = render(
      <RuleBuilder value={value} onChange={onChange} />,
    );
    const w = getWithin(container);

    fireEvent.click(w.getByRole("button", { name: /add rule/i }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0];
    expect(next.conditions).toHaveLength(1);
    expect(next.conditions[0]).toMatchObject({
      fieldName: "",
      fieldType: "string",
      operator: "==",
    });
  });

  it("calls onChange when Add Group is clicked", () => {
    const value = createEmptyRuleGroup("AND");
    const onChange = vi.fn();
    const { container } = render(
      <RuleBuilder value={value} onChange={onChange} />,
    );
    const w = getWithin(container);

    fireEvent.click(w.getByRole("button", { name: /add group/i }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0];
    expect(next.conditions).toHaveLength(1);
    expect(next.conditions[0]).toMatchObject({
      logicalOperator: "AND",
      conditions: [],
    });
  });

  it("nested group at depth 2: add group, add group inside, add rule inside inner group", () => {
    const value = createEmptyRuleGroup("AND");
    const onChange = vi.fn();
    const { container, rerender } = render(
      <RuleBuilder value={value} onChange={onChange} />,
    );
    const w = getWithin(container);

    fireEvent.click(w.getByRole("button", { name: /add group/i }));
    const afterFirstGroup = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    rerender(<RuleBuilder value={afterFirstGroup} onChange={onChange} />);

    const nestedEditors = container.querySelectorAll(".atari-ruleGroupEditor");
    const innerGroup = nestedEditors[nestedEditors.length - 1];
    const innerWithin = within(innerGroup as HTMLElement);
    fireEvent.click(innerWithin.getByRole("button", { name: /add group/i }));

    const afterSecondGroup = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(isRuleGroup(afterSecondGroup.conditions[0])).toBe(true);
    const firstChild = afterSecondGroup.conditions[0];
    if (!isRuleGroup(firstChild)) throw new Error("expected group");
    expect(firstChild.conditions).toHaveLength(1);
    expect(isRuleGroup(firstChild.conditions[0])).toBe(true);

    rerender(<RuleBuilder value={afterSecondGroup} onChange={onChange} />);
    const allGroups = container.querySelectorAll(".atari-ruleGroupEditor");
    const innermost = allGroups[allGroups.length - 1];
    const innermostWithin = within(innermost as HTMLElement);
    fireEvent.click(innermostWithin.getByRole("button", { name: /add rule/i }));

    const final = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    const outer = final.conditions[0];
    if (!isRuleGroup(outer)) throw new Error("expected group");
    const mid = outer.conditions[0];
    if (!isRuleGroup(mid)) throw new Error("expected group");
    expect(mid.conditions).toHaveLength(1);
    expect(isRule(mid.conditions[0])).toBe(true);
    expect(mid.conditions[0]).toMatchObject({
      fieldName: "",
      fieldType: "string",
      operator: "==",
    });
  });

  it("remove rule: add rule then remove", () => {
    const value = createEmptyRuleGroup("AND");
    const onChange = vi.fn();
    const { container, rerender } = render(
      <RuleBuilder value={value} onChange={onChange} />,
    );
    const w = getWithin(container);
    fireEvent.click(w.getByRole("button", { name: /add rule/i }));
    const withRule = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    rerender(<RuleBuilder value={withRule} onChange={onChange} />);

    const removeBtn = container.querySelector(".atari-ruleEditor-remove");
    expect(removeBtn).toBeInTheDocument();
    fireEvent.click(removeBtn!);

    const afterRemove = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(afterRemove.conditions).toHaveLength(0);
  });

  it("renders with fields prop for dropdown", () => {
    const value = createEmptyRuleGroup("AND");
    const fields = [
      { name: "age", type: "number" as const, label: "Age" },
      { name: "country", type: "string" as const, label: "Country" },
    ];

    const { container } = render(
      <RuleBuilder value={value} onChange={() => {}} fields={fields} />,
    );
    const w = getWithin(container);

    expect(
      w.getByRole("button", { name: /add rule/i }),
    ).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const value = createEmptyRuleGroup("AND");
    const { container } = render(
      <RuleBuilder
        value={value}
        onChange={() => {}}
        className="custom-builder"
      />,
    );

    const wrapper = container.querySelector(
      ".atari-ruleBuilder.custom-builder",
    );
    expect(wrapper).toBeInTheDocument();
  });

  it("applies custom labels", () => {
    const value = createEmptyRuleGroup("AND");
    const { container } = render(
      <RuleBuilder
        value={value}
        onChange={() => {}}
        labels={{ addRule: "Add condition", addGroup: "Add subgroup" }}
      />,
    );
    const w = getWithin(container);
    expect(w.getByRole("button", { name: /add condition/i })).toBeInTheDocument();
    expect(w.getByRole("button", { name: /add subgroup/i })).toBeInTheDocument();
  });

  it("maxDepth=2 hides Add Group inside nested group", () => {
    const value = createEmptyRuleGroup("AND");
    const onChange = vi.fn();
    const { container, rerender } = render(
      <RuleBuilder value={value} onChange={onChange} maxDepth={2} />,
    );
    const w = getWithin(container);
    fireEvent.click(w.getByRole("button", { name: /add group/i }));
    const withGroup = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    rerender(
      <RuleBuilder value={withGroup} onChange={onChange} maxDepth={2} />,
    );
    const nested = container.querySelectorAll(".atari-ruleGroupEditor");
    const inner = nested[nested.length - 1];
    const innerWithin = within(inner as HTMLElement);
    expect(innerWithin.queryByRole("button", { name: /add group/i })).toBeNull();
    expect(innerWithin.getByRole("button", { name: /add rule/i })).toBeInTheDocument();
  });

  it("showValidation displays validation errors for rule with empty fieldName", () => {
    const value = createEmptyRuleGroup("AND");
    const rule = createDefaultRule();
    const valueWithRule = {
      ...value,
      conditions: [{ ...rule, fieldName: "" }],
    };
    const { container } = render(
      <RuleBuilder
        value={valueWithRule}
        onChange={() => {}}
        showValidation
      />,
    );
    expect(container.textContent).toMatch(/fieldName|non-empty/i);
  });
});

describe("createDefaultRule", () => {
  it("returns rule with string fieldType and equals operator", () => {
    const rule = createDefaultRule();
    expect(rule).toMatchObject({
      fieldName: "",
      fieldType: "string",
      operator: "==",
      value: null,
    });
  });
});
