---
name: bugfix
description: 버그 수정 (원인 분석 → 계획 → 수정 → 회귀 테스트 → 보고)
user-invocable: true
---

# /bugfix — 버그 수정

## 워크플로우

### 1단계: 원인 분석
- Explore 에이전트로 버그 관련 코드 탐색
- 근본 원인(root cause) 파악
- 영향 범위 확인 (어떤 영역에 영향)

### 2단계: 계획서 작성
- `plans/bugfix/YYYYMMDD-{제목}.md` 작성
- 필수 포함: 원인 분석, 수정 방안, 영향 범위, 작업 배분

### 3단계: 사용자 승인
- 계획서를 사용자에게 제시
- **승인 전까지 디스패치하지 않음**
- 긴급 버그의 경우 사용자 명시적 요청 시 계획 생략 가능

### 4단계: 수정 디스패치
- 원인에 따라 적절한 팀원 디스패치
  - Backend 버그: Backend-engineer
  - Frontend 버그: Frontend-engineer
  - Electron 버그: Electron-engineer
  - 복합: 선행 작업 먼저 완료
- 에이전트 프로필(`docs/agents/*.md`)의 디스패치 템플릿 활용

### 5단계: 회귀 테스트
- QA-engineer 디스패치: 수정 확인 + 회귀 테스트
- Reviewer 병렬 디스패치: 수정 코드 리뷰

### 6단계: 보고
- 버그 원인, 수정 내용, 변경 파일, 테스트 결과, 리뷰 결과
- 커밋 필요 시 사용자에게 확인
