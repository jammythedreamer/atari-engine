import { describe, expect, it, vi } from "vitest";
import { evaluate } from "../src/evaluate.js";
import {
  FIELD_TYPES,
  LOGICAL_OPERATORS,
  OPERATORS,
  type RuleGroup,
  type UserProperties,
} from "../src/types.js";

describe("edge cases", () => {
  it("empty AND conditions returns true (vacuous truth)", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [],
    };
    expect(evaluate(rule, {})).toBe(true);
  });

  it("empty OR conditions returns false", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.OR,
      conditions: [],
    };
    expect(evaluate(rule, {})).toBe(false);
  });

  it("missing field returns false without throwing", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [
        {
          fieldName: "nonexistent",
          fieldType: FIELD_TYPES.STRING,
          operator: OPERATORS.EQUALS,
          value: "x",
        },
      ],
    };
    expect(evaluate(rule, {})).toBe(false);
  });

  it("type mismatch returns false and can report via onError", () => {
    const onError = vi.fn();
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [
        {
          fieldName: "age",
          fieldType: FIELD_TYPES.NUMBER,
          operator: OPERATORS.EQUALS,
          value: 18,
        },
      ],
    };
    const user: UserProperties = { age: "twenty" };
    expect(evaluate(rule, user, { onError })).toBe(false);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        code: expect.objectContaining({ id: "TYPE_MISMATCH" }),
      }),
    );
  });

  it("deeply nested RuleGroups evaluate correctly", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [
        {
          logicalOperator: LOGICAL_OPERATORS.OR,
          conditions: [
            {
              logicalOperator: LOGICAL_OPERATORS.AND,
              conditions: [
                {
                  fieldName: "a",
                  fieldType: FIELD_TYPES.NUMBER,
                  operator: OPERATORS.EQUALS,
                  value: 1,
                },
                {
                  fieldName: "b",
                  fieldType: FIELD_TYPES.STRING,
                  operator: OPERATORS.EQUALS,
                  value: "yes",
                },
              ],
            },
          ],
        },
      ],
    };
    expect(evaluate(rule, { a: 1, b: "yes" })).toBe(true);
    expect(evaluate(rule, { a: 0, b: "yes" })).toBe(false);
  });

  it("date field_type with ISO string compares correctly", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [
        {
          fieldName: "created",
          fieldType: FIELD_TYPES.DATE,
          operator: OPERATORS.GREATER_THAN_OR_EQUAL_TO,
          value: "2020-01-01T00:00:00Z",
        },
      ],
    };
    expect(evaluate(rule, { created: "2026-02-19T00:00:00Z" })).toBe(true);
  });

  it("date_unix field_type with number compares correctly", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [
        {
          fieldName: "ts",
          fieldType: FIELD_TYPES.DATE_UNIX,
          operator: OPERATORS.LESS_THAN,
          value: 2000000000000,
        },
      ],
    };
    expect(evaluate(rule, { ts: 1739923200000 })).toBe(true);
  });

  it("never throws", () => {
    const malformed = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [{}],
    } as unknown as RuleGroup;
    expect(() => evaluate(malformed, {})).not.toThrow();
    expect(evaluate(malformed, {})).toBe(false);
  });
});
