# 코딩 표준

## 네이밍 규칙
- **camelCase**: 함수, 변수
- **PascalCase**: 컴포넌트, 타입, 클래스 파일명
- **kebab-case**: 컴포넌트/클래스가 아닌 파일명, 디렉토리명
- **LARGE_SNAKE_CASE**: 외부에 정의되는 상수

## 코드 스타일
- 들여쓰기: **2칸 스페이스**
- `React.FC` 사용 **금지**
- `type` 선호, `interface` **지양**
- `export default`는 **페이지 컴포넌트만** 허용
- import 순서: 외부 → 내부 패키지 → 상대경로
- `any` 타입 **금지**
- 직접 DOM 조작(`document`, `window`) **최소화**
- `'use client'` **최소화**, 꼭 필요한 경우에만
- 2회 이상 재사용되는 문자열은 상수로 추출
- 약어 사전에 등재되지 않은 약어 사용 금지

## 성능 규칙
- **O(n²) 이상 로직 = 버그** — 2중 이상 중첩 루프는 잘못된 접근
- 기존 코드 패턴을 반드시 분석한 후 작업

## 오류 대응
- **같은 오류 3회 반복 시 접근 방식 재검토** — 다른 방법을 시도

## 팀원 간 파일 충돌 방지
- Frontend-engineer는 `src/app/` 내부만 수정
- Backend-engineer는 `src/backend/`, `prisma/`, `src/lib/db/` 내부만 수정
- Electron-engineer는 `electron/` 내부만 수정
- 서로의 영역을 직접 수정하지 않음
- 다른 영역 변경이 필요하면 해당 엔지니어에게 요청

## Console 객체
- 운영 배포 허용: `console.info`, `console.warn`, `console.error`, `console.table`
- 운영 배포 금지: `console.log`, `console.debug`, `console.dir`, `console.time` 등
