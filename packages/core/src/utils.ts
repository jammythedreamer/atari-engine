import { FIELD_TYPES } from "./types.js";
import type { FieldType, UserProperties } from "./types.js";

export function getNestedValue(obj: UserProperties, path: string): unknown {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

export function coerceToComparable(
  value: unknown,
  fieldType: FieldType,
): number | string | boolean | null | undefined {
  if (value === null || value === undefined) {
    return value;
  }
  if (fieldType === FIELD_TYPES.DATE) {
    if (typeof value !== "string") return undefined;
    const ms = new Date(value).getTime();
    return Number.isNaN(ms) ? undefined : ms;
  }
  if (fieldType === FIELD_TYPES.DATE_UNIX) {
    if (typeof value !== "number") return undefined;
    return value;
  }
  if (fieldType === FIELD_TYPES.NUMBER && typeof value !== "number")
    return undefined;
  if (fieldType === FIELD_TYPES.STRING && typeof value !== "string")
    return undefined;
  if (fieldType === FIELD_TYPES.BOOLEAN && typeof value !== "boolean")
    return undefined;
  return value as number | string | boolean;
}
