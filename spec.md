# 🎰 Atari (アタリ) Project Specification

## 1. Overview

**Atari**는 A/B 테스트, 피처 플래그(Feature Flag), 마케팅 캠페인 대상을 선별하기 위한 초경량 타겟팅 룰 엔진(Targeting Rule Engine)입니다.
A/B 테스트 라우팅 서비스, 캠페인 서비스 등에 사용될 수 있으며, 특정 유저가 설정된 조건(Rule)에 부합하는지 판별하는 역할을 수행합니다.

## 2. Core Principles

- **Edge-Native (Zero Dependency):** Cloudflare Workers, V8 Isolates 등 엣지 환경에서의 콜드 스타트(Cold Start)를 최소화하기 위해 외부 의존성(npm packages) 및 Node.js 내장 모듈(`fs`, `crypto` 등)을 전혀 사용하지 않는 순수 함수(Pure Logic)로 구현합니다.
- **Isomorphic:** 동일한 코드가 Cloudflare Workers, Node.js, 브라우저 환경에서 100% 동일하게 동작해야 합니다.
- **Infinite Nesting:** 룰 평가 로직은 트리(Tree) 구조의 재귀(Recursive) 함수로 작성되어, 이론상 무한한 깊이의 `AND`/`OR` 중첩 조건을 지원합니다.

## 3. Architecture & Monorepo Structure

프로젝트는 `pnpm workspace` 기반의 모노레포(Monorepo)로 구성되어, 생태계 확장을 용이하게 합니다.

- **`/packages/core` (`@atari-engine/core`)**
  - **역할:** 순수 룰 평가 엔진 (Rule Evaluation Engine).
  - **입력:** 유저 속성(JSON) + 룰 트리(JSON).
  - **출력:** `boolean` (True: 타겟팅 대상 / False: 대상 아님).
- **`/packages/react` (`@atari-engine/react`)** — Phase 2
  - **역할:** 룰 트리를 시각적으로 생성하고 편집할 수 있는 React UI 컴포넌트(Rule Builder).
  - **특징:** `@atari-engine/core`의 타입 스키마를 완벽히 공유하며, 사용성(UX)을 위해 UI 상의 중첩 Depth는 2~3단계로 제한할 수 있습니다.

## 4. Data Schema (Core Types)

모든 룰은 직렬화(Serialization) 가능한 JSON 형태로 정의 및 저장됩니다.

### 4.1. Operators

타겟팅 판별에 사용되는 기본 연산자 목록입니다. (추후 확장 가능)

| Operator                   | 설명               | 허용 FieldType                                     |
| -------------------------- | ------------------ | -------------------------------------------------- |
| `EQUALS`                   | ==                 | `string`, `number`, `boolean`, `date`, `date_unix` |
| `NOT_EQUALS`               | !=                 | `string`, `number`, `boolean`, `date`, `date_unix` |
| `GREATER_THAN`             | >                  | `number`, `date`, `date_unix`                      |
| `GREATER_THAN_OR_EQUAL_TO` | >=                 | `number`, `date`, `date_unix`                      |
| `LESS_THAN`                | <                  | `number`, `date`, `date_unix`                      |
| `LESS_THAN_OR_EQUAL_TO`    | <=                 | `number`, `date`, `date_unix`                      |
| `IN`                       | 배열 내 포함       | `string`, `number`                                 |
| `NOT_IN`                   | 배열 내 미포함     | `string`, `number`                                 |
| `CONTAINS`                 | 문자열 부분 일치   | `string`                                           |
| `NOT_CONTAINS`             | 문자열 부분 미일치 | `string`                                           |
| `STARTS_WITH`              | 접두 매칭          | `string`                                           |
| `ENDS_WITH`                | 접미 매칭          | `string`                                           |
| `EXISTS`                   | 필드 존재 여부     | 모든 타입 (value 무시)                             |
| `NOT_EXISTS`               | 필드 미존재 여부   | 모든 타입 (value 무시)                             |

`validate` 함수는 이 매트릭스를 기준으로 `operator`/`field_type` 조합의 유효성을 검증합니다.

### 4.2. Field Types

필드 타입입니다. (추후 확장 가능)

- `string`
- `number`
- `boolean`
- `date` — ISO 8601 문자열 (`"2026-02-19T00:00:00Z"`). 내부적으로 `new Date(value).getTime()`으로 변환 후 숫자 비교.
- `date_unix` — Unix timestamp in milliseconds (`1739923200000`, number). 변환 없이 직접 숫자 비교. UI datepicker 등에서 number 값을 그대로 사용할 때 적합.

### 4.3. Rule Interface

다중 중첩을 지원하기 위한 재귀적(Recursive) 데이터 구조입니다.

```typescript
type RuleValue = string | number | boolean | null | string[] | number[];

// 단일 조건 (Leaf Node)
// field_name은 dot notation을 지원합니다. (e.g. "address.city")
export interface Rule {
  field_name: string;
  field_type: FieldType;
  operator: Operator;
  value: RuleValue;
}

// 조건 그룹 (Branch Node) - 다중 중첩의 핵심
export interface RuleGroup {
  logicalOperator: "AND" | "OR";
  conditions: (Rule | RuleGroup)[];
}

// 유저 속성 객체 - 중첩 객체를 허용하여 dot notation 접근 지원
export type UserProperties = { [key: string]: RuleValue | UserProperties };
```

## 5. Public API

### 5.1. `evaluate(rule, context): boolean`

엔진의 핵심 진입점입니다. 주어진 룰 트리를 유저 속성(context)에 대해 평가하여 `boolean`을 반환합니다.

```typescript
import { evaluate } from "@atari-engine/core";

const rule: RuleGroup = {
  logicalOperator: "AND",
  conditions: [
    {
      field_name: "age",
      field_type: "number",
      operator: "GREATER_THAN_OR_EQUAL_TO",
      value: 18,
    },
    {
      field_name: "country",
      field_type: "string",
      operator: "IN",
      value: ["KR", "JP", "US"],
    },
  ],
};

const user: UserProperties = { age: 25, country: "KR" };

evaluate(rule, user); // true
```

### 5.2. `validate(rule): ValidationResult`

룰 트리의 구조적 유효성을 검사합니다. 빈 `conditions`, 잘못된 `operator`/`field_type` 조합 등을 사전에 검출합니다.

```typescript
import { validate } from "@atari-engine/core";

const result = validate(rule);
// { valid: true } or { valid: false, errors: [{ path: "conditions[0]", message: "..." }] }
```

## 6. Error Handling

패키지 사용자가 에러를 직접 핸들링할 수 있도록, 예상되는 에러를 명시적 타입으로 정의합니다.

### 6.1. Error Types

```typescript
export class AtariError extends Error {
  code: AtariErrorCode;
}

export type AtariErrorCode =
  | "FIELD_NOT_FOUND" // context에 field_name이 존재하지 않음
  | "TYPE_MISMATCH" // field_type과 실제 값의 타입 불일치
  | "INVALID_OPERATOR" // field_type에 사용할 수 없는 operator
  | "INVALID_RULE" // 룰 구조 자체가 잘못됨
  | "EMPTY_CONDITIONS"; // RuleGroup.conditions가 빈 배열
```

### 6.2. Default Behavior

`evaluate`는 기본적으로 **절대 throw하지 않으며**, 에러 상황에서 안전한 기본값을 반환합니다.

| 상황               | 기본 동작                                      |
| ------------------ | ---------------------------------------------- |
| `FIELD_NOT_FOUND`  | `false` 반환                                   |
| `TYPE_MISMATCH`    | `false` 반환                                   |
| `EMPTY_CONDITIONS` | `AND` → `true`, `OR` → `false` (vacuous truth) |

### 6.3. Strict Mode (Optional)

사용자가 엄격한 에러 핸들링을 원하면, `onError` 콜백을 통해 에러를 수신할 수 있습니다.

```typescript
evaluate(rule, user, {
  onError: (error: AtariError) => {
    console.warn(`[atari] ${error.code}: ${error.message}`);
  },
});
```

`validate` 함수를 통해 실행 전에 룰의 구조적 문제(빈 conditions 등)를 사전 검출하는 것을 권장합니다.

## 7. Testing

- **테스트 프레임워크:** `vitest`
- **커버리지 목표:** 핵심 로직(`evaluate`, `validate`) 100% branch coverage
- **테스트 카테고리:**
  - **Unit:** 개별 연산자별 평가 (FieldType × Operator 조합)
  - **Integration:** 중첩 RuleGroup 평가, dot notation 접근, 에러 핸들링
  - **Edge cases:** 빈 conditions, 존재하지 않는 필드, 타입 불일치, 깊은 중첩

## 8. Build & Distribution

### 7.1. Package

| 항목              | 값                       |
| ----------------- | ------------------------ |
| npm scope         | `@atari-engine`          |
| 모듈 포맷         | ESM + CJS (dual package) |
| 번들러            | `tsup`                   |
| TypeScript target | `ES2022`                 |
| 타입              | `.d.ts` 동시 배포        |

### 7.2. `package.json` Exports

```json
{
  "name": "@atari-engine/core",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"]
}
```

### 7.3. Compatibility

| 환경               | 지원               |
| ------------------ | ------------------ |
| Cloudflare Workers | O (primary target) |
| Node.js >= 18      | O                  |
| 브라우저 (ES2022+) | O                  |
| Deno / Bun         | O (ESM 호환)       |

## 9. Roadmap

| Phase       | 패키지                | 내용                                            |
| ----------- | --------------------- | ----------------------------------------------- |
| **Phase 1** | `@atari-engine/core`  | 룰 평가 엔진, 타입 스키마, validate, 테스트     |
| **Phase 2** | `@atari-engine/react` | Rule Builder UI 컴포넌트, core 타입 스키마 공유 |
