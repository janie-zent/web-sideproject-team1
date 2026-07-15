# FSD 아키텍처 가이드 — 올챙이 프론트엔드

> 올챙이 FE의 **공용 코딩 기준 문서**입니다. 새 코드를 작성하거나 리뷰할 때 이 문서를 기준으로 판단합니다.
> 기준: [Feature-Sliced Design](https://feature-sliced.design/) 2.1 · 2026-07-09 팀 회의에서 확정.
> 결정의 배경·탈락안은 문서 맨 아래 [결정 로그](#결정-로그)에 있습니다.

---

## 0. 한눈에 보기 (Cheat Sheet)

| 항목 | 우리 규칙 |
| --- | --- |
| **레이어 (위→아래)** | `app` → `widgets` → `features` → `entities` → `shared` — **`views`(pages) 레이어는 쓰지 않음** |
| **화면 조합** | `app/**/page.tsx`가 **위젯을 조합**해 렌더 (page.tsx는 얇게). 위젯은 **페이지 단위**로 관리 |
| **세그먼트** | `ui` · `model` · `api` **3종으로 시작** (필요 시 `lib`/`config` 추가) |
| **import 방향** | 항상 아래로만. 같은 레이어 슬라이스끼리 import 금지 |
| **cross-import(@x)** | **무조건 금지** |
| **슬라이스 접근** | `index.ts`(공개 API)로만. deep import 금지 (**테스트는 예외**) |
| **path alias** | `@/*` 유지. 같은 슬라이스 내부는 상대경로 |
| **FE ↔ BE** | FE는 `src/backend` **직접 import 금지(HTTP만)**. 공유 타입은 `src/shared/types` |
| **데이터 페칭** | base=`shared/api` · 조회=entity · 명령=feature · **React Query 사용** |
| **스타일** | **SCSS** + CSS Modules 패턴(`*.module.scss`), 컴포넌트 옆 코로케이션 |
| **네이밍** | 폴더 kebab-case · feature=동사구 · entity=단수명사 · 컴포넌트 `PascalCase.tsx` |
| **린트** | **Steiger** + CI |
| **적용 범위** | `src/backend` · `src/app/api` · `electron`은 **FSD 대상 아님** |

---

## 1. 레이어

우리는 **5개 레이어**를 사용합니다. 표준 FSD의 `pages`(=`views`) 레이어는 **쓰지 않고**, 그 역할(화면 조합)을 `widgets`가 대신합니다.

| 레이어 | 역할 | 판별 질문 | 올챙이 예시 |
| --- | --- | --- | --- |
| `app` | 전역 설정 + Next 라우터 진입점 | "앱 전체에 딱 한 번?" | 루트 레이아웃, Provider(React Query 등), `globals`, 라우트 `page.tsx` |
| `widgets` | **페이지 단위** UI 블록 (한 화면 = 위젯) | "한 화면(또는 떼어낼 만한 큰 블록)인가?" | `calendar`(월간 캘린더 화면), `login`, `app-header` |
| `features` | 사용자 행동 (도메인 단위 분리 가능) | "'~하기'라고 부를 행동인가? (동사)" | `create-event`, `toggle-notification`, `complete-schedule` |
| `entities` | 도메인 명사 (데이터 + 표현) | "우리 서비스의 명사인가?" | `event`, `session`, `tax-schedule`, `notification` |
| `shared` | 도메인 무관 공통 코드 | "다른 서비스에 그대로 가져가도 되나?" | `Button`, `Modal`, fetch 래퍼, 날짜 유틸 |

**import은 항상 위→아래로만** 흐릅니다. 레이어 건너뛰기(`entities → shared`)는 OK, 역방향은 어떤 경우에도 금지입니다.

> **`views`를 뺀 이유** — 화면 조합은 `app/page.tsx` + `widgets`로 충분하고, 레이어가 하나 줄어 판단 비용이 낮아집니다. "한 화면"은 페이지 단위 위젯(예: `widgets/calendar`)으로 만들고, `app/calendar/page.tsx`는 그 위젯을 렌더하는 얇은 파일로 둡니다.

---

## 2. 슬라이스와 세그먼트

- **슬라이스(Slice)** — 레이어 안을 도메인으로 나눈 폴더. 예: `entities/tax-schedule`, `features/create-event`.
  `app`과 `shared`는 슬라이스가 없고 바로 세그먼트로 나뉩니다.
- **세그먼트(Segment)** — 슬라이스 안을 기술 목적별로 나눈 폴더. **`ui` / `model` / `api` 3종으로 시작**합니다.

| 세그먼트 | 담는 것 | 예시 (`entities/tax-schedule`) |
| --- | --- | --- |
| `ui` | 컴포넌트, 스타일 | `ScheduleBadge.tsx`, `ScheduleBadge.module.scss` |
| `model` | 타입, 상태, 훅, 비즈니스 로직, query 키/훅 | `types.ts`, `useSchedules.ts` |
| `api` | 서버 통신 함수 | `fetchSchedules.ts` |

> `lib`(전용 유틸)·`config`(전용 상수)는 **실제로 필요해질 때** 추가합니다. 빈 폴더는 미리 만들지 않습니다.

---

## 3. 절대 규칙 3가지

### 규칙 1 — 의존성은 아래로만

자기보다 **아래에 있는** 레이어만 import할 수 있습니다.

```text
// ✅ 허용 (위 → 아래)
widgets/calendar        → features/create-event
features/create-event   → entities/event
entities/event          → shared/api      // 레이어 건너뛰기 OK

// ❌ 금지
entities/event          → features/create-event   // 역방향
shared/ui               → entities/notification    // shared는 shared·외부 라이브러리만
```

역방향이 필요해 보이면 **코드가 잘못된 레이어에 있다는 신호**입니다. import를 뚫지 말고 코드를 옮기거나, 상위 로직을 props로 주입받도록 뒤집습니다.

### 규칙 2 — 같은 레이어 슬라이스끼리는 격리

`features/login`이 `features/toggle-notification`을 import하면 안 됩니다. 두 슬라이스가 뭔가를 공유해야 하면 그 공유물을 **아래 레이어(entities/shared)로 내립니다**.

> **cross-import(`@x`)는 우리 프로젝트에서 무조건 금지합니다.** entity끼리 얽히면 아래 순서로 해결하세요.
> 1. **상위 레이어에서 조합** — widget이 두 entity를 각각 import해 props로 내려주기 (기본 해법)
> 2. **원시값으로만 참조** — 객체 대신 ID 등만 주고받기
>
> `entities/*/@x/*.ts` 파일은 만들지 않습니다.

### 규칙 3 — 슬라이스 접근은 공개 API(`index.ts`)로만

각 슬라이스는 루트에 `index.ts`를 두고 **외부에 필요한 최소만** export합니다. 내부 파일 직접 접근(deep import)은 금지입니다.

```ts
// entities/tax-schedule/index.ts — 필요한 것만 명시 (export * 금지)
export { ScheduleBadge } from './ui/ScheduleBadge'
export { useSchedules } from './model/useSchedules'
export type { TaxSchedule } from './model/types'
```

```ts
// ✅ 공개 API 경유
import { ScheduleBadge, type TaxSchedule } from '@/entities/tax-schedule'

// ❌ deep import — 내부 구현에 직접 접근
import { ScheduleBadge } from '@/entities/tax-schedule/ui/ScheduleBadge'
```

- `shared`는 슬라이스가 없으므로 **세그먼트별 index**를 둡니다 (`@/shared/ui`, `@/shared/api` …). shared 전체를 하나의 배럴로 묶지 않습니다 — 컴파일·번들 성능과 순환참조 때문입니다.
- **테스트 코드는 deep import를 허용**합니다 (내부 단위 테스트가 내부 모듈을 직접 보는 건 자연스럽습니다).
- 이 규칙은 사람 리뷰가 아니라 **Steiger 린터**로 집행합니다.

---

## 4. 배치 판단 — "이거 어디 둬요?"

헷갈릴 때 아래 **순서대로** 판단합니다.

1. **명사인가 동사인가?** — 세무일정 그 자체(타입·조회·뱃지)는 `entities/tax-schedule`. "일정을 완료 처리한다"는 `features/complete-schedule`.
2. **도메인 지식이 없는가?** — 도메인 단어를 몰라도 성립하는 코드(범용 `Button`, 날짜 포맷터)만 `shared`. 도메인 단어가 하나라도 들어가면 shared 금지.
3. **한 화면이거나 자립적인 큰 블록인가?** — 캘린더 화면처럼 entities/features를 엮은 덩어리면 `widgets`.
4. **그래도 모르겠으면 → 그 화면의 페이지 위젯 안에 둡니다.** 두 번째 사용처가 생기는 순간 아래 레이어로 추출합니다. **추상화를 미리 만들지 않는 것**이 핵심입니다.

**실전 배치 예시**

| 이 코드는 | 어디에 | 왜 |
| --- | --- | --- |
| 일정 추가 모달 `AddEventModal` | `features/create-event` | 사용자 행동(동사) + 상태를 바꾸는 mutation |
| `CalEvent` 타입·카테고리 메타 | `entities/event/model` | 도메인 명사의 데이터 모델 |
| 일정 칩 `EventChip` | `entities/event/ui` | "이벤트"라는 명사를 그리는 표현 UI |
| 월간 캘린더 화면 (`Calendar` + grid + header) | `widgets/calendar` | 페이지 단위 화면 블록 |
| D-day 계산 함수 | `entities/tax-schedule/model`(또는 `lib`) | "신고 기한" 도메인 지식 포함 — shared 금지 |
| 범용 `Popup`·`Toggle` | `shared/ui` | 도메인 무관 — 다른 서비스에 그대로 가져가도 성립 |

---

## 5. 폴더 구조

```
src/
├── app/          # Next 라우터 + 전역 설정. page.tsx는 위젯 조합만 (얇게)
│                 #   예: app/calendar/page.tsx → widgets/calendar 를 렌더
├── widgets/      # 페이지 단위 UI 블록 — 한 화면 = 위젯
│                 #   calendar · login · app-header ...
├── features/     # 사용자 행동 (도메인 단위 분리 가능)
│                 #   create-event · toggle-notification · complete-schedule ...
├── entities/     # 도메인 명사
│                 #   event · session · tax-schedule · notification ...
├── shared/       # 도메인 무관 공통 (세그먼트별 index)
│   ├── ui/       #   Button · Modal · Popup · Toggle ...
│   ├── api/      #   fetch 래퍼 + React Query 설정 (base client)
│   ├── lib/      #   범용 유틸 (날짜 등)
│   ├── config/   #   전역 상수
│   └── types/    #   ★ FE·BE 공유 타입 (중립 폴더) — 4.6 참고
└── backend/      # FSD 범위 밖 — 기존 services/repositories 구조 유지
```

각 슬라이스의 내부:

```
entities/tax-schedule/
├── index.ts      # 공개 API (필요한 것만 export)
├── ui/
├── model/
└── api/
```

---

## 6. 세부 컨벤션

### 6.1 path alias

- 기존 `@/*` 하나를 유지합니다: `@/entities/tax-schedule`, `@/shared/ui`.
- **같은 슬라이스 내부는 상대경로**(`./model`), **슬라이스 밖은 `@/` alias**를 씁니다. import 문만 봐도 "슬라이스 경계를 넘는지"가 드러나 deep import를 잡기 쉬워집니다.

### 6.2 네이밍

- 슬라이스·세그먼트 폴더: **kebab-case** (`tax-schedule`)
- `feature`는 **동사구**(`complete-schedule`), `entity`는 **단수 명사**(`tax-schedule`)
- 컴포넌트 파일: **`PascalCase.tsx`** (`ScheduleBadge.tsx`), 훅: `use*.ts`
- 슬라이스 이름에 레이어 의미를 중복하지 않기 — `features/feature-login` ✗
- `index.ts`에는 **re-export만** 두고 구현 코드를 넣지 않기

### 6.3 데이터 페칭 (React Query)

| 위치 | 담당 |
| --- | --- |
| `shared/api` | base 클라이언트: fetch 래퍼, 공통 에러 처리, `/api/v1` prefix, 인증 헤더. React Query `QueryClient` 기본 설정 |
| `app` | `QueryClientProvider` 등 전역 Provider 배치 |
| `entities/*/api` | 도메인 **조회** 요청 + DTO→모델 매핑 (`fetchSchedules.ts`) |
| `features/*/api` | 상태를 바꾸는 **명령(mutation)** (`completeSchedule.ts`) |
| `entities/*/model` | 해당 도메인의 **query 키·useQuery 훅**, Dexie `liveQuery` 훅 |

관례: **"조회는 entity, 명령은 feature"**. 컴포넌트 안에 `fetch`를 직접 흩뿌리지 않습니다.

### 6.4 스타일

- **SCSS + CSS Modules 패턴**: `*.module.scss`.
- 스타일 파일은 컴포넌트와 **같은 폴더·같은 이름**으로 코로케이션합니다.
  ```
  widgets/calendar/ui/EventChip.tsx
  widgets/calendar/ui/EventChip.module.scss
  ```
- 클래스는 `import styles from './EventChip.module.scss'` 후 `styles.chip`으로 참조합니다. 전역 스코프 클래스는 피합니다(슬라이스가 늘수록 충돌 위험).

### 6.5 테스트

- 테스트는 `__tests__/` 폴더에 둡니다 (BE가 이미 쓰는 관례에 맞춤).
- 테스트 코드는 슬라이스 내부로의 deep import를 허용합니다.

### 6.6 FE ↔ BE 경계

- FE는 `src/backend/**`을 **직접 import하지 않습니다.** Prisma·bcrypt 같은 서버 전용 모듈이 클라이언트 번들에 끌려 들어가는 사고를 막기 위함입니다. FE·BE 경계는 **HTTP(`/api/v1`) 호출로만** 넘습니다.
- **공유 타입은 `src/shared/types` 중립 폴더**에 정의하고 FE·BE 양쪽이 import합니다. 서로의 내부를 직접 참조하지 않습니다.
  - 예: 공통 응답 타입 `ApiResponse`, 도메인 DTO(`User`, `LoginResponse`)를 `src/shared/types`에 두고, BE는 응답 직렬화에, FE는 entity `model`의 도메인 모델 매핑 입력으로 사용.
- 이 경계는 lint 규칙으로 집행합니다.

### 6.7 적용 범위 (FSD 대상 아님)

`src/backend/**`, `src/app/api/**`, `electron/**`은 **FSD 규칙의 대상이 아닙니다.** BE는 기존 services/repositories 계층 구조를 그대로 유지합니다.

---

## 7. 린트 · 집행

- **Steiger**(FSD 공식 린터)를 사용합니다.
  ```bash
  pnpm add -D steiger @feature-sliced/steiger-plugin
  npx steiger ./src
  ```
- `steiger.config.ts`로 규칙을 조정합니다. 우리는 **`views` 레이어 미사용 · 세그먼트 3종**의 커스텀 구성이므로, 이에 맞춰 레이어 목록/세그먼트 규칙을 설정해야 합니다.
- **CI와 pre-commit**에 연결해 위반을 자동 차단합니다. (Steiger는 베타 단계라는 점 감안)

---

## 8. 마이그레이션 방침

- 열린 대형 PR(#2 캘린더 · #4 로그인·팝업)은 **현행 구조 그대로 머지**한 뒤, FSD 스캐폴딩·린터가 준비되면 **"이동만" PR**(리팩토링과 섞지 않음)로 FSD 배치로 옮깁니다.
- 스타일은 **SCSS로 통일**합니다(#4의 일반 CSS 버전을 #2의 SCSS 기준으로 정리).
- 구체적인 이동 순서·매핑은 **FSD 도입(스캐폴딩) 이후 규칙에 따라 별도로** 진행합니다.
- 그 시점부터 **신규 FE 코드는 FSD 필수**입니다.

---

## 9. PR 체크리스트

- [ ] 새 코드가 올바른 레이어에 있는가? (명사=entity / 동사=feature / 화면=widget)
- [ ] import가 `index.ts`(공개 API)를 경유하는가? (deep import 없음, 테스트 제외)
- [ ] 같은 레이어 슬라이스끼리 import하지 않는가? (`@x` 없음)
- [ ] import 방향이 아래로만 흐르는가?
- [ ] FE가 `src/backend`를 직접 import하지 않는가?
- [ ] 스타일이 `*.module.scss`이고 컴포넌트와 코로케이션됐는가?
- [ ] Steiger 통과하는가?

---

## 결정 로그

2026-07-09 팀 회의 확정 내용. (`①`은 원 추천안, 실제 확정은 "확정" 열 기준)

| # | 항목 | 확정 | 근거 · 비고 |
| --- | --- | --- | --- |
| A-1 | Next.js 충돌 해법 | **`views`/`pages` 레이어 미사용.** `src/app`을 Next 라우터 겸 FSD `app`으로 사용 | 레이어 자체를 안 써 이름 충돌을 원천 제거 |
| A-2 | 레이어 세트 | `app · widgets · features · entities · shared` (**views 제외, widgets 사용**) | widgets가 페이지 단위 조합 담당 |
| A-3 | 적용 경계 | **FE→backend import 절대 금지**, HTTP로만. backend/api/electron은 FSD 밖 | 서버 모듈 번들 유입 방지 |
| B-4 | 초기 슬라이스 목록 | PR 코드 기준 도메인 지도. **widget=페이지 단위**, **features 도메인 단위 분리 허용** | `views` 제거 반영 |
| B-5 | 세그먼트 표준 | **`ui`/`model`/`api` 3종으로 시작** | 필요 시 `lib`/`config` 추가 |
| B-7 | 네이밍 | kebab-case · feature=동사구 / entity=단수명사 · 컴포넌트 `PascalCase.tsx` | 대안 없음, 확정 |
| C-8 | Public API 정책 | `index.ts` 최소 export · shared 세그먼트별 index · **테스트 deep import 허용** · 린터 집행 | 추천안대로 |
| C-9 | cross-import(`@x`) | **무조건 금지** | 얽히면 상위 조합 / 원시값 참조로 해결 |
| C-10 | 린트 도구 | **Steiger** + CI | |
| C-11 | path alias | 기존 **`@/*` 유지**, 슬라이스 내부는 상대경로 | |
| D-12 | 데이터 페칭 배치 | base=`shared/api` · 조회=entity · 명령=feature · **React Query 도입** | query 키/훅은 entity `model` |
| D-13 | FE↔BE 타입 공유 | **`src/shared/types` 중립 폴더**를 만들어 FE·BE가 공유 | (추천안 ①이 아닌 중립 폴더안 채택) |
| — | 스타일 | **SCSS** (CSS Modules 패턴) | |

> 확정을 뒤집을 때는 이 표의 행을 지우지 말고 근거에 사유를 남기세요 (예: "Steiger 베타 이슈로 CI가 막히면 재검토").

---