import { describe, expect, it, vi } from "vitest";
import { evaluate } from "../src/evaluate.js";
import {
  FIELD_TYPES,
  LOGICAL_OPERATORS,
  OPERATORS,
  type RuleGroup,
  type UserProperties,
} from "../src/types.js";

describe("evaluate", () => {
  it("returns true for AND group when all conditions match", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [
        {
          fieldName: "age",
          fieldType: FIELD_TYPES.NUMBER,
          operator: OPERATORS.GREATER_THAN_OR_EQUAL_TO,
          value: 18,
        },
        {
          fieldName: "country",
          fieldType: FIELD_TYPES.STRING,
          operator: OPERATORS.IN,
          value: ["KR", "JP", "US"],
        },
      ],
    };
    const user: UserProperties = { age: 25, country: "KR" };
    expect(evaluate(rule, user)).toBe(true);
  });

  it("returns false for AND group when one condition fails", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [
        {
          fieldName: "age",
          fieldType: FIELD_TYPES.NUMBER,
          operator: OPERATORS.EQUALS,
          value: 25,
        },
        {
          fieldName: "country",
          fieldType: FIELD_TYPES.STRING,
          operator: OPERATORS.EQUALS,
          value: "US",
        },
      ],
    };
    const user: UserProperties = { age: 25, country: "KR" };
    expect(evaluate(rule, user)).toBe(false);
  });

  it("returns true for OR group when at least one condition matches", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.OR,
      conditions: [
        {
          fieldName: "role",
          fieldType: FIELD_TYPES.STRING,
          operator: OPERATORS.EQUALS,
          value: "admin",
        },
        {
          fieldName: "country",
          fieldType: FIELD_TYPES.STRING,
          operator: OPERATORS.EQUALS,
          value: "KR",
        },
      ],
    };
    const user: UserProperties = { country: "KR" };
    expect(evaluate(rule, user)).toBe(true);
  });

  it("evaluates EQUALS for string, number, boolean", () => {
    expect(
      evaluate(
        {
          logicalOperator: LOGICAL_OPERATORS.AND,
          conditions: [
            {
              fieldName: "a",
              fieldType: FIELD_TYPES.STRING,
              operator: OPERATORS.EQUALS,
              value: "x",
            },
          ],
        },
        { a: "x" },
      ),
    ).toBe(true);
    expect(
      evaluate(
        {
          logicalOperator: LOGICAL_OPERATORS.AND,
          conditions: [
            {
              fieldName: "n",
              fieldType: FIELD_TYPES.NUMBER,
              operator: OPERATORS.EQUALS,
              value: 42,
            },
          ],
        },
        { n: 42 },
      ),
    ).toBe(true);
    expect(
      evaluate(
        {
          logicalOperator: LOGICAL_OPERATORS.AND,
          conditions: [
            {
              fieldName: "b",
              fieldType: FIELD_TYPES.BOOLEAN,
              operator: OPERATORS.EQUALS,
              value: true,
            },
          ],
        },
        { b: true },
      ),
    ).toBe(true);
  });

  it("evaluates NOT_EQUALS, GREATER_THAN, LESS_THAN", () => {
    const user: UserProperties = { score: 50 };
    expect(
      evaluate(
        {
          logicalOperator: LOGICAL_OPERATORS.AND,
          conditions: [
            {
              fieldName: "score",
              fieldType: FIELD_TYPES.NUMBER,
              operator: OPERATORS.NOT_EQUALS,
              value: 0,
            },
          ],
        },
        user,
      ),
    ).toBe(true);
    expect(
      evaluate(
        {
          logicalOperator: LOGICAL_OPERATORS.AND,
          conditions: [
            {
              fieldName: "score",
              fieldType: FIELD_TYPES.NUMBER,
              operator: OPERATORS.GREATER_THAN,
              value: 40,
            },
          ],
        },
        user,
      ),
    ).toBe(true);
    expect(
      evaluate(
        {
          logicalOperator: LOGICAL_OPERATORS.AND,
          conditions: [
            {
              fieldName: "score",
              fieldType: FIELD_TYPES.NUMBER,
              operator: OPERATORS.LESS_THAN,
              value: 60,
            },
          ],
        },
        user,
      ),
    ).toBe(true);
  });

  it("evaluates IN and NOT_IN", () => {
    const user: UserProperties = { code: "KR" };
    expect(
      evaluate(
        {
          logicalOperator: LOGICAL_OPERATORS.AND,
          conditions: [
            {
              fieldName: "code",
              fieldType: FIELD_TYPES.STRING,
              operator: OPERATORS.IN,
              value: ["KR", "JP"],
            },
          ],
        },
        user,
      ),
    ).toBe(true);
    expect(
      evaluate(
        {
          logicalOperator: LOGICAL_OPERATORS.AND,
          conditions: [
            {
              fieldName: "code",
              fieldType: FIELD_TYPES.STRING,
              operator: OPERATORS.NOT_IN,
              value: ["US"],
            },
          ],
        },
        user,
      ),
    ).toBe(true);
  });

  it("evaluates CONTAINS, STARTS_WITH, ENDS_WITH", () => {
    const user: UserProperties = { name: "hello-world" };
    expect(
      evaluate(
        {
          logicalOperator: LOGICAL_OPERATORS.AND,
          conditions: [
            {
              fieldName: "name",
              fieldType: FIELD_TYPES.STRING,
              operator: OPERATORS.CONTAINS,
              value: "lo-w",
            },
          ],
        },
        user,
      ),
    ).toBe(true);
    expect(
      evaluate(
        {
          logicalOperator: LOGICAL_OPERATORS.AND,
          conditions: [
            {
              fieldName: "name",
              fieldType: FIELD_TYPES.STRING,
              operator: OPERATORS.STARTS_WITH,
              value: "hel",
            },
          ],
        },
        user,
      ),
    ).toBe(true);
    expect(
      evaluate(
        {
          logicalOperator: LOGICAL_OPERATORS.AND,
          conditions: [
            {
              fieldName: "name",
              fieldType: FIELD_TYPES.STRING,
              operator: OPERATORS.ENDS_WITH,
              value: "rld",
            },
          ],
        },
        user,
      ),
    ).toBe(true);
  });

  it("evaluates EXISTS and NOT_EXISTS", () => {
    expect(
      evaluate(
        {
          logicalOperator: LOGICAL_OPERATORS.AND,
          conditions: [
            {
              fieldName: "present",
              fieldType: FIELD_TYPES.STRING,
              operator: OPERATORS.EXISTS,
              value: null,
            },
          ],
        },
        { present: "any" },
      ),
    ).toBe(true);
    expect(
      evaluate(
        {
          logicalOperator: LOGICAL_OPERATORS.AND,
          conditions: [
            {
              fieldName: "missing",
              fieldType: FIELD_TYPES.STRING,
              operator: OPERATORS.NOT_EXISTS,
              value: null,
            },
          ],
        },
        { other: 1 },
      ),
    ).toBe(true);
  });

  it("evaluates nested RuleGroups", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [
        {
          fieldName: "age",
          fieldType: FIELD_TYPES.NUMBER,
          operator: OPERATORS.GREATER_THAN_OR_EQUAL_TO,
          value: 18,
        },
        {
          logicalOperator: LOGICAL_OPERATORS.OR,
          conditions: [
            {
              fieldName: "country",
              fieldType: FIELD_TYPES.STRING,
              operator: OPERATORS.EQUALS,
              value: "KR",
            },
            {
              fieldName: "country",
              fieldType: FIELD_TYPES.STRING,
              operator: OPERATORS.EQUALS,
              value: "JP",
            },
          ],
        },
      ],
    };
    expect(evaluate(rule, { age: 20, country: "KR" })).toBe(true);
    expect(evaluate(rule, { age: 20, country: "US" })).toBe(false);
  });

  it("supports dot notation for nested context", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [
        {
          fieldName: "address.city",
          fieldType: FIELD_TYPES.STRING,
          operator: OPERATORS.EQUALS,
          value: "Seoul",
        },
      ],
    };
    const user: UserProperties = { address: { city: "Seoul" } };
    expect(evaluate(rule, user)).toBe(true);
  });

  it("calls onError when field is not found and returns false", () => {
    const onError = vi.fn();
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [
        {
          fieldName: "missing",
          fieldType: FIELD_TYPES.STRING,
          operator: OPERATORS.EQUALS,
          value: "x",
        },
      ],
    };
    const result = evaluate(rule, {}, { onError });
    expect(result).toBe(false);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        code: expect.objectContaining({ id: "FIELD_NOT_FOUND" }),
      }),
    );
  });
});
