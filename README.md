# 세무일정관리 (올챙이) — Side Project

Next.js + Electron 풀스택 데스크톱 앱. 
**Claude Code 멀티 에이전트 팀**으로 개발되며, Plan-First 워크플로우를 따른다.

> 이 레포를 Claude Code에서 열면 `CLAUDE.md`가 자동으로 Team Lead 가이드로 로드된다.

## 개발 흐름 (Plan-First)

```
사용자 요청 → Team Lead 분석 → 계획서 작성 → 사용자 승인 
→ 에이전트 디스패치 → 검증 (QA + Reviewer) → 보고
```

**핵심**: 계획서 승인 후만 구현한다. 불필요한 재작업 방지 + 방향성 확보.

## 기술 스택

| 구분 | 내용 |
|------|------|
| 프레임워크 | Next.js 14 App Router, React 18, TypeScript |
| 서버 DB | SQLite via Prisma (개발 API용) |
| 클라이언트 DB | IndexedDB via Dexie 4.x |
| 인증 | JWT (HS256) + bcryptjs |
| 데스크톱 | Electron 42 (트레이, 팝오버, 네이티브 알림) |
| 스타일 | CSS Modules |
| 패키지 매니저 | pnpm |
| 테스트 | Vitest |

## 디렉토리 구조

```
web-sideproject-team1/
├── CLAUDE.md                     # Team Lead 가이드북 ★
├── README.md                     # 이 파일
│
├── .claude/
│   ├── settings.json             # 멀티 에이전트 팀 설정
│   ├── rules/                    # 개발 규칙
│   │   ├── coding-standards.md
│   │   ├── dispatch-protocol.md
│   │   ├── git-workflow.md
│   │   └── language.md
│   └── skills/                   # 슬래시 커맨드
│       ├── feature/SKILL.md, bugfix/SKILL.md
│       ├── review/SKILL.md, test/SKILL.md, status/SKILL.md
│
├── docs/
│   ├── agents/                   # 5개 에이전트 프로필 ★
│   │   ├── frontend-engineer.md  (src/app/)
│   │   ├── backend-engineer.md   (src/backend/, prisma/, src/lib/db/)
│   │   ├── electron-engineer.md  (electron/)
│   │   ├── qa-engineer.md
│   │   └── reviewer.md
│   └── plan-template.md          # 계획서 템플릿 ★
│
├── plans/
│   ├── feature/                  # 기능 계획서 저장
│   └── bugfix/                   # 버그 계획서 저장
│
├── src/
│   ├── app/                      # Next.js 페이지/컴포넌트 (Frontend-engineer)
│   ├── backend/                  # API 라우트, 서비스, 저장소 (Backend-engineer)
│   ├── lib/db/                   # Dexie IndexedDB 스키마 (Backend-engineer)
│   └── middleware.ts
│
├── electron/                     # Electron Main Process (Electron-engineer)
├── prisma/                       # Prisma 스키마 (Backend-engineer)
└── ... (package.json, tsconfig.json, vitest.config.ts 등)
```

### 담당 영역별 디렉토리
- **Frontend-engineer**: `src/app/`
- **Backend-engineer**: `src/backend/`, `src/lib/db/`, `prisma/`
- **Electron-engineer**: `electron/`
- **QA-engineer**: 전체 테스트
- **Reviewer**: 전체 코드 리뷰

## 팀 구성 (Claude Code 멀티 에이전트)

| 역할 | 담당 영역 | 프로필 |
|------|-----------|--------|
| **Team Lead** | 요구사항 분석, 계획, 디스패치, 검증 | `CLAUDE.md` |
| **Frontend-engineer** | `src/app/` (페이지, 컴포넌트) | `docs/agents/frontend-engineer.md` |
| **Backend-engineer** | `src/backend/`, `prisma/`, `src/lib/db/` | `docs/agents/backend-engineer.md` |
| **Electron-engineer** | `electron/` (main, preload, IPC) | `docs/agents/electron-engineer.md` |
| **QA-engineer** | Vitest 테스트 작성/실행 | `docs/agents/qa-engineer.md` |
| **Reviewer** | 코드 리뷰 (읽기 전용) | `docs/agents/reviewer.md` |

### 핵심 규칙
- ✅ 각 에이전트는 **담당 영역만 수정**
- ✅ **파일 충돌 없음** (영역 분리)
- ✅ **순서 있는 디스패치** (DB → UI → Electron → 검증)
- ✅ **Plan-First**: 계획서 승인 후만 구현

## 슬래시 커맨드

| 명령어 | 기능 |
|--------|------|
| `/feature` | 신규 기능 개발 (계획 → 승인 → 디스패치 → 검증) |
| `/bugfix` | 버그 수정 (원인 분석 → 계획 → 수정 → 회귀 테스트) |
| `/review` | 코드 리뷰 (git diff → Reviewer 디스패치 → 보고) |
| `/test` | 테스트 작성/실행 (대상 파악 → QA-engineer 디스패치) |
| `/status` | 프로젝트 현황 (git status, 최근 커밋) |

## 시작하기

### 1. 이 레포를 Claude Code에서 열기
```bash
claude code open /Users/janie/Documents/playground/web-sideproject-team1
```

### 2. CLAUDE.md 읽기
`CLAUDE.md`가 Team Lead 가이드북이다.

### 3. 기능 요청하기
```
/feature 세무 일정 목록 화면 추가
```
→ 계획서 작성 → 승인 → 에이전트 디스패치

### 4. 개발 명령어
```bash
pnpm dev                    # 전체 개발 서버
pnpm build                  # 빌드
pnpm lint                   # ESLint
pnpm test                   # Vitest
pnpm prisma db push        # Prisma 스키마 적용
pnpm prisma db seed        # 시드 데이터
```

## 데이터베이스 (SQLite + IndexedDB)

### SQLite (개발 API용, `prisma/`)
- 사용자 인증 정보 저장 (User 모델)
- Prisma ORM으로 관리
- 개발 모드에서만 API가 동작 (static export 때문)

### IndexedDB (클라이언트, `src/lib/db/`)
- Dexie 4.x 사용
- 세무 일정, 세무 유형, 알림 등 도메인 모델 (현재 미구현)
- 스키마는 `src/lib/db/schema.ts`의 `SCHEMA_VERSIONS`로 선언
- 초기 데이터는 `src/lib/db/seed.ts`의 `seedIfEmpty()` 호출

## 커밋 메시지 형식

```
[타입](영역): 한국어 설명
```

예시:
```
feat(frontend): 세무 일정 목록 화면 추가
fix(backend): JWT 검증 오류 수정
test(db): Dexie 스키마 단위 테스트
chore(prisma): User 모델 마이그레이션
```

## 더 알아보기

### 팀 구성 & 워크플로우
- **`CLAUDE.md`** — Team Lead 가이드북 (반드시 읽기)
- **`docs/agents/`** — 5개 에이전트 프로필 (기획 맞춤)
  - frontend-engineer: 로그인, 캘린더, 관리자 대시보드 등
  - backend-engineer: API 17개, Prisma + Dexie 스키마
  - electron-engineer: 팝오버, IPC, 알림
- **`.claude/rules/`** — 코딩 표준, 디스패치 규칙, Git 규칙
- **`docs/plan-template.md`** — 계획서 템플릿
