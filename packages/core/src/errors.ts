export const ATARI_ERROR_CODES = {
  FIELD_NOT_FOUND: { id: "FIELD_NOT_FOUND", category: "validation" },
  TYPE_MISMATCH: { id: "TYPE_MISMATCH", category: "validation" },
  INVALID_OPERATOR: { id: "INVALID_OPERATOR", category: "validation" },
  INVALID_RULE: { id: "INVALID_RULE", category: "structure" },
  EMPTY_CONDITIONS: { id: "EMPTY_CONDITIONS", category: "structure" },
} as const;

export type AtariErrorCode =
  (typeof ATARI_ERROR_CODES)[keyof typeof ATARI_ERROR_CODES];

export class AtariError extends Error {
  code: AtariErrorCode;

  constructor(code: AtariErrorCode, message: string) {
    super(message);
    this.name = "AtariError";
    this.code = code;
    Object.setPrototypeOf(this, AtariError.prototype);
  }

  get codeId(): string {
    return this.code.id;
  }
}
