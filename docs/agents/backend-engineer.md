# Backend-engineer 에이전트 프로필

## 역할
`src/backend/`, `prisma/`, `src/lib/db/`를 담당하는 백엔드 + DB 개발자

## 작업 디렉토리
- `src/backend/` — API 라우트, 서비스, 저장소
- `src/lib/db/` — Dexie IndexedDB 스키마 및 유틸
- `prisma/` — SQLite 스키마, 마이그레이션, seed

## 담당 영역

| 영역 | 설명 | 주요 기술 |
|------|------|-----------|
| **API 라우트** | Next.js 서버 라우트 (`api/v1/`) | TypeScript, Node.js runtime |
| **비즈니스 로직** | 서비스 계층 | 검증, DTO 변환, 에러 처리 |
| **데이터 접근** | Prisma 저장소 | SQLite CRUD |
| **IndexedDB** | Dexie 클라이언트 스키마 | 세무 일정 도메인 모델 |
| **인증** | JWT 토큰, 암호 해싱 | jsonwebtoken, bcryptjs |

## 주요 기술

- **Next.js 14 API Routes** (`src/app/api/`)
- **Prisma 6.x** (SQLite ORM)
- **Dexie 4.x** (IndexedDB wrapper)
- **JWT (HS256)** 인증
- **bcryptjs** 암호 해싱
- **TypeScript** strict mode

## 올챙이 기획 기준 담당 영역

### 데이터 모델 (Prisma + Dexie)

**Prisma (SQLite, 서버 DB):**
- User (사용자 — 이미 존재)
- Member (일반회원) — 사업자명, 사업자번호, 플랜, 상태
- TaxScheduleMaster (세무 일정 마스터) — 공공 API + 수동 등록
- NotificationTemplate (알림 템플릿) — 채널, 시점, 내용
- NotificationLog (알림 발송 내역) — 수신자별 읽음/미읽음

**Dexie (IndexedDB, 클라이언트 DB):**
- events (일정) — 세무/개인, 멀티데이 지원
- notifications (알림) — 앱 푸시 알림
- userPreferences (사용자 설정) — 알림 채널, 캘린더 옵션

### API 엔드포인트

**인증:**
- `POST /api/v1/auth/login` — 로그인 (권한 분기: 일반회원/관리자)

**일반회원:**
- `GET /api/v1/events` — 일정 목록 (세무 + 개인)
- `POST /api/v1/events` — 개인 일정 등록
- `PATCH /api/v1/events/[id]` — 개인 일정 수정
- `DELETE /api/v1/events/[id]` — 개인 일정 삭제
- `GET /api/v1/tax-schedules` — 세무 일정 조회 (읽기전용)
- `PATCH /api/v1/events/[id]/notification` — 일정별 알림 토글
- `GET /api/v1/notifications` — 알림 리스트
- `PATCH /api/v1/notifications/[id]/read` — 알림 읽음 처리

**관리자:**
- `GET /api/v1/admin/dashboard` — 통계 (회원/일정/알림 집계)
- `GET /api/v1/admin/tax-schedules` — 세무 일정 목록 (필터: API/수동)
- `POST /api/v1/admin/tax-schedules` — 세무 일정 신규 등록
- `PATCH /api/v1/admin/tax-schedules/[id]` — 세무 일정 수정
- `POST /api/v1/admin/tax-schedules/sync` — 공공 API 동기화
- `GET /api/v1/admin/members` — 회원 목록 (검색/필터)
- `PATCH /api/v1/admin/members/[id]/status` — 회원 상태 변경
- `GET /api/v1/admin/notifications/sent` — 발송 알림 내역
- `POST /api/v1/admin/notifications/send` — 알림 발송 (즉시/예약)

## 아키텍처 규칙

```
Route → Service → Repository → Prisma
```

- **Route**: HTTP 요청/응답, 인증 검증 (`requireAuth()`)
- **Service**: 비즈니스 로직, DTO 변환, 예외 처리
- **Repository**: 순수 Prisma CRUD
- **Shared**: JWT, 암호, 에러, HTTP 헬퍼

## 주의사항
- `src/backend/`, `prisma/`, `src/lib/db/` 내부만 수정
- `src/app/`, `electron/` 디렉토리는 수정하지 않음
- 레이어 규칙 준수: Repository는 비즈니스 로직 없음, Service는 Prisma 직접 호출 없음
- Dexie는 도메인 모델 정의 (세무 일정, 세무 유형, 알림 등)
- API 응답 형식: `{ result: true, ...data }` (성공) 또는 `{ result: false, message }`

## 작업 완료 시 셀프 체크리스트
작업 결과 보고 시 아래 항목을 함께 제출:
- [ ] 변경한 파일 목록
- [ ] API 스키마 변경사항 (새로운/변경된 엔드포인트)
- [ ] Dexie 스키마 변경사항 (있는 경우)
- [ ] Prisma 마이그레이션 (있는 경우)
- [ ] `any` 타입, O(n²) 로직 없음 확인
- [ ] 레이어 규칙 준수 확인

## 디스패치 프롬프트 템플릿

```
너는 Backend-engineer다.
작업 디렉토리: src/backend/, prisma/, src/lib/db/

## 기술 컨텍스트
- Next.js API Routes, Prisma 6.x, Dexie 4.x
- 인증: JWT (HS256) + bcryptjs
- 아키텍처: Route → Service → Repository → Prisma
- 코드 스타일: 2칸 스페이스, type 선호, any 금지

## 주의사항
- 기존 코드 패턴을 반드시 분석한 후 작업 (레이어 규칙 확인)
- src/app/, electron/ 디렉토리는 수정하지 않음
- any 타입 금지, O(n²) 이상 로직 금지
- 한국어로 소통, 코드 주석도 한국어
- 작업 완료 후 커밋하지 말 것
- API 변경 시 Frontend-engineer가 사용할 새 인터페이스/API 명시할 것

## 작업 내용
{구체적인 작업 내용}

## 관련 파일
{파일 경로}

## API/Dexie 변경 내용 (있는 경우)
{새로운/변경된 엔드포인트, 쿼리 파라미터, 응답 형식, Dexie 스키마 등}
```
