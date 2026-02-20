import { describe, expect, it } from "vitest";
import {
  FIELD_TYPES,
  LOGICAL_OPERATORS,
  OPERATORS,
  type Rule,
  type RuleGroup,
} from "../src/types.js";
import { validate } from "../src/validate.js";

describe("validate", () => {
  it("returns valid: true for valid RuleGroup", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [
        {
          fieldName: "age",
          fieldType: FIELD_TYPES.NUMBER,
          operator: OPERATORS.GREATER_THAN_OR_EQUAL_TO,
          value: 18,
        },
      ],
    };
    expect(validate(rule)).toEqual({ valid: true });
  });

  it("returns valid: false for empty conditions", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [],
    };
    const result = validate(rule);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(
        result.errors.some((e) => e.message.includes("at least one condition")),
      ).toBe(true);
    }
  });

  it("returns valid: false for invalid operator/field_type combination", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [
        {
          fieldName: "name",
          fieldType: FIELD_TYPES.STRING,
          operator: OPERATORS.GREATER_THAN,
          value: 0,
        },
      ],
    };
    const result = validate(rule);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.message.includes("not allowed"))).toBe(
        true,
      );
    }
  });

  it("returns valid: false for invalid field_type", () => {
    const rule = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [
        {
          fieldName: "x",
          fieldType: "invalid_type",
          operator: OPERATORS.EQUALS,
          value: 1,
        },
      ],
    };
    const result = validate(rule as RuleGroup);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.message.includes("fieldType"))).toBe(
        true,
      );
    }
  });

  it("returns valid: true for EXISTS/NOT_EXISTS without value requirement", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [
        {
          fieldName: "opt",
          fieldType: FIELD_TYPES.STRING,
          operator: OPERATORS.EXISTS,
          value: null,
        },
      ],
    };
    expect(validate(rule)).toEqual({ valid: true });
  });

  it("returns valid: false for null rule", () => {
    const result = validate(null as unknown as Rule);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it("validates nested RuleGroups and collects errors with path", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [
        {
          logicalOperator: LOGICAL_OPERATORS.OR,
          conditions: [
            {
              fieldName: "name",
              fieldType: FIELD_TYPES.STRING,
              operator: OPERATORS.GREATER_THAN,
              value: 0,
            },
          ],
        },
      ],
    };
    const result = validate(rule);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.path.includes("conditions"))).toBe(
        true,
      );
    }
  });

  it("returns valid: false when value type does not match field_type number", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [
        {
          fieldName: "age",
          fieldType: FIELD_TYPES.NUMBER,
          operator: OPERATORS.EQUALS,
          value: "18",
        },
      ],
    };
    const result = validate(rule);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(
        result.errors.some(
          (e) =>
            e.message.includes("number") && e.message.includes("fieldType"),
        ),
      ).toBe(true);
    }
  });

  it("returns valid: false when value type does not match field_type string", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [
        {
          fieldName: "name",
          fieldType: FIELD_TYPES.STRING,
          operator: OPERATORS.EQUALS,
          value: 123,
        },
      ],
    };
    const result = validate(rule);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(
        result.errors.some(
          (e) =>
            e.message.includes("string") && e.message.includes("fieldType"),
        ),
      ).toBe(true);
    }
  });

  it("returns valid: false when value type does not match field_type boolean", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [
        {
          fieldName: "active",
          fieldType: FIELD_TYPES.BOOLEAN,
          operator: OPERATORS.EQUALS,
          value: "true",
        },
      ],
    };
    const result = validate(rule);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(
        result.errors.some(
          (e) =>
            e.message.includes("boolean") && e.message.includes("fieldType"),
        ),
      ).toBe(true);
    }
  });

  it("returns valid: false for IN operator when value is not an array", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [
        {
          fieldName: "code",
          fieldType: FIELD_TYPES.STRING,
          operator: OPERATORS.IN,
          value: "KR",
        },
      ],
    };
    const result = validate(rule);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(
        result.errors.some(
          (e) => e.message.includes("array") && e.message.includes("IN/NOT_IN"),
        ),
      ).toBe(true);
    }
  });

  it("returns valid: false for IN with field_type number when value is not number[]", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [
        {
          fieldName: "scores",
          fieldType: FIELD_TYPES.NUMBER,
          operator: OPERATORS.IN,
          value: ["1", "2"],
        },
      ],
    };
    const result = validate(rule);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(
        result.errors.some(
          (e) =>
            e.message.includes("number[]") && e.message.includes("IN/NOT_IN"),
        ),
      ).toBe(true);
    }
  });

  it("returns valid: true for IN with correct value types", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [
        {
          fieldName: "country",
          fieldType: FIELD_TYPES.STRING,
          operator: OPERATORS.IN,
          value: ["KR", "JP", "US"],
        },
      ],
    };
    expect(validate(rule)).toEqual({ valid: true });
  });

  it("returns valid: false for field_type date when value is not valid ISO date string", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [
        {
          fieldName: "created_at",
          fieldType: FIELD_TYPES.DATE,
          operator: OPERATORS.EQUALS,
          value: "not-a-date",
        },
      ],
    };
    const result = validate(rule);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(
        result.errors.some(
          (e) => e.message.includes("valid") && e.message.includes("date"),
        ),
      ).toBe(true);
    }
  });

  it("returns valid: true for field_type date with valid ISO date string", () => {
    const rule: RuleGroup = {
      logicalOperator: LOGICAL_OPERATORS.AND,
      conditions: [
        {
          fieldName: "created_at",
          fieldType: FIELD_TYPES.DATE,
          operator: OPERATORS.EQUALS,
          value: "2024-01-15T00:00:00.000Z",
        },
      ],
    };
    expect(validate(rule)).toEqual({ valid: true });
  });
});
