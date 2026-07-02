# 세무일정관리 (side-project)

Next.js(App Router) 단일 프로젝트로 **백엔드·프론트엔드를 모두** 담당하는 풀스택 사이드 프로젝트.
데이터 저장소는 **IndexedDB**(Dexie.js)를 사용한다 — 별도 서버/DB 없이 브라우저 내에서 동작한다.

## 기술 스택

| 구분 | 내용 |
|------|------|
| 프레임워크 | Next.js 15 (App Router), React 18, TypeScript |
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

## Electron 데스크톱 앱

개발 모드(핫리로드)로 데스크톱 앱 실행:

```bash
pnpm install        # 최초 1회 (postinstall 이 prisma client 생성)
pnpm electron:dev
```

`electron:dev` 가 하는 일: ① `next dev -p 14000` 기동 → ② 포트 14000 대기(`wait-on`) → ③ `electron/*.ts` 컴파일(`dist-electron/`) → ④ Electron 창에서 `http://localhost:14000` 로드(+ DevTools 자동 오픈).

- 렌더러(화면) 코드는 핫리로드되지만, `electron/main.ts` 등 **메인 프로세스 코드를 고치면 `electron:dev` 를 재시작**해야 한다.
- dev/프로덕션 판별은 `NODE_ENV` 가 아니라 `app.isPackaged` 기준이다 — 패키징하지 않은 채 Electron 을 직접 실행하면 항상 dev 로 간주해 `localhost:14000` 을 찾는다.

배포용 패키지(정적 export + electron-builder):

```bash
pnpm electron:dist   # next build → out/ → electron-builder (설정: electron-builder.yml)
```

## 데이터베이스 (IndexedDB / Dexie)

- 스키마(DDL)는 `src/lib/db/schema.ts`의 `SCHEMA_VERSIONS`로 선언한다. 스키마를 바꿀 때는 새 `version`을 추가한다.
- 초기 데이터는 `src/lib/db/seed.ts`의 `seedIfEmpty()`로 삽입한다. IndexedDB는 브라우저 전용이므로 앱 첫 로드 시점에 클라이언트에서 호출한다.
- 현재는 도메인 모델 확정 전이라 스토어/시드가 비어있는 **껍데기** 상태다.
