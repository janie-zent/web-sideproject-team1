# 작업계획서 템플릿

파일 위치: `plans/{작업유형}/YYYYMMDD-{제목}.md`

---

```markdown
# {작업 제목}

## 1. 개요

| 항목 | 내용 |
|------|------|
| **작업 유형** | feature / bugfix / refactor |
| **요청 요약** | {무엇을 왜 하는지 1-2줄 요약} |
| **범위** | Frontend / Backend / Electron / 복합 |
| **추정 시간** | {예상 작업 시간} |

## 2. 현재 상태

- 기존 코드 참조: {관련 파일 경로}
- 현재 동작: {현재 어떻게 동작하는지}
- 문제점/개선점: {왜 변경이 필요한지}

## 3. 데이터 모델 변경 (Backend 작업인 경우)

### Prisma 스키마 변경
```typescript
// 새로운/수정 모델
model Example {
  id Int @id @default(autoincrement())
  name String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Dexie IndexedDB 스키마 변경
```typescript
// 새로운/수정 테이블
interface ExampleTable {
  key?: number
  name: string
  createdAt: number
}
```

### API 엔드포인트 변경

#### 새로운/수정 엔드포인트
- `GET /api/v1/admin/examples` — 목록 조회
  - 쿼리: `?page=1&limit=20`
  - 응답: `{ result: true, data: [...], total: 100 }`
- `POST /api/v1/admin/examples` — 추가
  - 바디: `{ name: string }`
  - 응답: `{ result: true, data: { id, name, ... } }`

### 의존성
- Backend: 전 없음 (선행)
- Frontend: Backend API 완료 대기

## 4. Frontend 변경 (Frontend 작업인 경우)

### 라우트 + 페이지
- 경로: `/example`
- 레이아웃: 기존 레이아웃 활용
- 페이지 파일: `src/app/example/page.tsx`

### 컴포넌트 구조
```
ExamplePage/
├── ExampleList/
│   ├── ExampleItem/
│   └── ExampleFilter/
└── ExampleDetail/
```

### 상태 관리
- 서버 상태: API 호출 (직접 또는 로컬 state)
- 클라이언트 상태: 로컬 state 또는 Context API

### 화면 설계
{스크린샷 또는 레이아웃 설명}

### 의존성
- Backend: {필요한 API 리스트}
- Frontend: 위의 Backend API 완료 대기

## 5. Electron 변경 (Electron 작업인 경우)

### IPC 메시지 변경
```typescript
// 새로운/수정 IPC 핸들러
interface ExampleMessage {
  action: 'example-action'
  payload: { ... }
}
```

### 창 + 프로토콜
- 새로운 창이 필요한가? (필요하면 크기, URL 명시)
- 기존 창에만 추가되는가?

### 의존성
- Frontend/Backend: {필요한 기능}

## 6. 작업 배분

| 담당 | 작업 내용 | 의존성 | 예상 시간 |
|------|-----------|--------|----------|
| **Backend-engineer** | {백엔드 작업 내용} | 없음 | {시간} |
| **Frontend-engineer** | {프론트엔드 작업 내용} | Backend 완료 (해당 시) | {시간} |
| **Electron-engineer** | {일렉트론 작업 내용} | {의존성} | {시간} |
| **QA-engineer** | {테스트 작업} | 구현 완료 | {시간} |
| **Reviewer** | {리뷰 범위} | 구현 완료 | {시간} |

## 7. 의존성 패턴

**적용 패턴:**
- Backend 데이터 모델 변경 → Frontend UI 반영
- Frontend IPC 호출 → Electron 핸들러 추가

**선행 작업:**
1. Backend-engineer: DB 스키마, API 구현
2. Frontend-engineer: UI 컴포넌트, API 호출
3. QA + Reviewer: 병렬 검증

## 8. 검증 기준

### 성공 조건
- [ ] 백엔드: 모든 API 엔드포인트 정상 작동
- [ ] 프론트엔드: UI에서 데이터 정상 조회/추가/수정/삭제
- [ ] 테스트: 모든 테스트 통과
- [ ] 리뷰: 코드 품질 기준 통과 (Critical 이슈 없음)

### 테스트 계획
- 단위 테스트: {테스트할 기능}
- 통합 테스트: {API + UI 연동 테스트}

## 9. 참고 사항
{추가 고려사항, 주의사항 등}
```

---

## 작성 원칙

1. **타입 우선**: TypeScript 인터페이스로 모호함 제거
2. **API 스키마가 핵심**: 엔드포인트와 응답이 명확해야 독립 작업 가능
3. **관심사 분리**: 백엔드, 프론트엔드, 일렉트론 영역 구분 명확히
4. **간결하게**: 스펙과 배분에 집중, 불필요한 서술 제외
