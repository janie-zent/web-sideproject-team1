# 세무일정관리 (side-project)

Next.js(App Router) 단일 프로젝트로 **백엔드·프론트엔드를 모두** 담당하는 풀스택 사이드 프로젝트.
데이터 저장소는 **IndexedDB**(Dexie.js)를 사용한다 — 별도 서버/DB 없이 브라우저 내에서 동작한다.

## 기술 스택

| 구분 | 내용 |
|------|------|
| 프레임워크 | Next.js 14 (App Router), React 18, TypeScript |
| 데이터 | IndexedDB (Dexie.js), dexie-react-hooks |
| 스타일 | CSS Modules (추가 UI 라이브러리 없음) |
| 패키지 매니저 | pnpm |

## 디렉토리 구조

```
side-project/
├── src/
│   ├── app/                 # FE: 라우트/페이지/레이아웃 (App Router)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── page.module.css
│   │   └── globals.css
│   └── lib/
│       └── db/              # BE: IndexedDB 데이터 계층
│           ├── schema.ts    #   스키마(DDL) 정의 — 스토어/인덱스/엔티티 타입
│           ├── index.ts     #   Dexie 인스턴스
│           └── seed.ts      #   초기 데이터 시드 스크립트
├── next.config.mjs
├── tsconfig.json
└── package.json
```

## be / fe 책임 분리 (단일 레포)

하나의 Next.js 프로젝트지만 작업 영역을 나눠 충돌을 방지한다.

- **BE**: `src/lib/**`(특히 `src/lib/db`), 도메인 로직, `src/app/api/**`(필요 시), 서버 액션
- **FE**: `src/app/**`의 page/layout, `src/components/**`, 클라이언트 훅·CSS Modules

## 시작하기

```bash
pnpm install
pnpm dev        # http://localhost:14000
```

## 데이터베이스 (IndexedDB / Dexie)

- 스키마(DDL)는 `src/lib/db/schema.ts`의 `SCHEMA_VERSIONS`로 선언한다. 스키마를 바꿀 때는 새 `version`을 추가한다.
- 초기 데이터는 `src/lib/db/seed.ts`의 `seedIfEmpty()`로 삽입한다. IndexedDB는 브라우저 전용이므로 앱 첫 로드 시점에 클라이언트에서 호출한다.
- 현재는 도메인 모델 확정 전이라 스토어/시드가 비어있는 **껍데기** 상태다.
