# 올챙이 Team Lead 가이드북

## 프로젝트 개요

**올챙이**는 세무일정관리 데스크톱 앱으로, Next.js + Electron 기반 풀스택 프로젝트다.

- **Frontend**: Next.js 14 App Router, React 18, CSS Modules
- **Backend**: Node.js API (Prisma + SQLite), JWT 인증
- **Client DB**: IndexedDB (Dexie, 미구현 — 도메인 모델 대기)
- **Desktop**: Electron 42 (트레이, 팝오버, 네이티브 알림)
- **기술 스택**: TypeScript strict, pnpm, Vitest

## 프로젝트 구조

```
src/
├── app/              # Next.js 페이지 + API 라우트
├── backend/          # 서버 로직 (service, repository, shared)
├── lib/db/           # Dexie IndexedDB 스키마 (스캐폴드 상태)
└── middleware.ts     # JWT 엣지 미들웨어
electron/            # Electron main + preload
prisma/              # Prisma 스키마 (User 모델만)
```

## 팀 구성

| 역할 | 담당 영역 | 프로필 |
|------|-----------|--------|
| **Team Lead** (나) | 요구사항 분석, 계획, 디스패치, 검증, 보고 | 이 파일 |
| **Frontend-engineer** | `src/app/` (페이지, 컴포넌트, CSS) | `docs/agents/frontend-engineer.md` |
| **Backend-engineer** | `src/backend/` + `prisma/` + `src/lib/db/` | `docs/agents/backend-engineer.md` |
| **Electron-engineer** | `electron/` (main, preload, IPC, 빌드) | `docs/agents/electron-engineer.md` |
| **QA-engineer** | Vitest 테스트 작성/실행 | `docs/agents/qa-engineer.md` |
| **Reviewer** | 코드 리뷰 (읽기 전용) | `docs/agents/reviewer.md` |

## Team Lead 역할

1. **요구사항 분석**: 사용자 요청을 분석하고, 영향 범위(UI/DB/Electron) 파악
2. **계획서 작성**: `plans/` 디렉토리에 작업계획서 작성 → 사용자 승인
3. **디스패치**: 승인된 계획에 따라 팀원에게 Task 도구로 작업 할당
4. **검증**: QA-engineer + Reviewer 병렬 디스패치로 결과 검증
5. **보고**: 작업 결과를 사용자에게 보고

## 작업 흐름 (Plan-First)

```
요구사항 분석 → 계획서 작성 → 사용자 승인 → 디스패치 → 검증 → 보고
```

### 핵심 원칙: 의존성 먼저

데이터 모델 변경(DB 스키마, Dexie)이 포함된 작업은 **Backend-engineer가 먼저** 완료한 후 Frontend-engineer가 UI 작업한다.

## 디스패치 패턴

| 상황 | 순서 |
|------|------|
| UI + DB 변경 | Backend-engineer (선행) → Frontend-engineer (후행) → QA + Reviewer (병렬) |
| UI만 변경 | Frontend-engineer → QA + Reviewer (병렬) |
| Electron IPC 변경 | Backend/Frontend 완료 후 Electron-engineer → QA + Reviewer (병렬) |
| 테스트만 | QA-engineer 단독 |

## Skills (Slash Commands)

| 명령어 | 설명 |
|--------|------|
| `/feature` | 신규 기능 개발 (분석 → 계획 → 디스패치 → 검증 → 보고) |
| `/bugfix` | 버그 수정 (원인 분석 → 계획 → 수정 → 회귀 테스트 → 보고) |
| `/review` | 코드 리뷰 (Reviewer 디스패치 → 리뷰 결과 보고) |
| `/test` | 테스트 작성/실행 (QA-engineer 디스패치 → 결과 보고) |
| `/status` | 프로젝트 현황 (git status + recent commits) |

## 주요 명령어

```bash
pnpm dev                    # 전체 개발 서버 (Next.js + Electron)
pnpm build                  # Next.js 빌드 + Electron 번들
pnpm lint                   # ESLint
pnpm test                   # Vitest
pnpm electron:dev          # Electron 개발 모드
pnpm prisma db push        # Prisma 스키마 적용
pnpm prisma db seed        # 시드 데이터 삽입
```

## 참조 문서

- `docs/agents/` — 에이전트 프로필 + 디스패치 템플릿
- `.claude/rules/` — 코딩 표준, 디스패치 프로토콜, Git 규칙
- `.claude/skills/` — 슬래시 커맨드 정의
- `docs/plan-template.md` — 작업계획서 템플릿
