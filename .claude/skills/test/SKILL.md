---
name: test
description: 테스트 작성/실행 (QA-engineer 디스패치 → 결과 보고)
user-invocable: true
---

# /test — 테스트 작성/실행

## 워크플로우

### 1단계: 테스트 대상 분석
- 사용자 요청에 따라 테스트 대상 파악
- 적절한 테스트 레벨 결정:
  - **단위 테스트**: Vitest + TypeScript
  - **통합 테스트**: Vitest + 실제 데이터
  - **E2E 테스트**: Playwright (Electron 통합 테스트)

### 2단계: QA-engineer 디스패치
- `docs/agents/qa-engineer.md`의 디스패치 템플릿 활용
- 테스트 대상, 레벨, 기대 결과 전달

### 3단계: 결과 보고
- 테스트 pass/fail 상태
- 커버리지 정보 (가능한 경우)
- 실패 테스트 상세 (원인, 수정 필요 사항)

## 테스트 인프라 현황
- **전체**: Vitest 설정 존재
- 테스트 파일 규칙: `__test__/` 또는 `*.test.ts(x)`
