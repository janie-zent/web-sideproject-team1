---
name: feature
description: 신규 기능 개발 (분석 → 계획 → 디스패치 → 검증 → 보고)
user-invocable: true
---

# /feature — 신규 기능 개발

## 워크플로우

### 1단계: 요구사항 분석
- 사용자 요청을 분석하여 영향 범위 파악 (UI/DB/Electron)
- Explore 에이전트로 관련 코드 탐색
- 적용할 디스패치 패턴 결정 (`docs/dispatch-protocol.md` 참조)

### 2단계: 계획서 작성
- `plans/feature/YYYYMMDD-{제목}.md` 작성
- `docs/plan-template.md` 템플릿 사용
- 필수 포함: DB 스키마 변경, API 변경사항, UI 설계, 작업 배분

### 3단계: 사용자 승인
- 계획서를 사용자에게 제시
- **승인 전까지 디스패치하지 않음**

### 4단계: 디스패치
- `.claude/rules/dispatch-protocol.md` 준수
- DB 변경 포함 시: Backend-engineer 선행 → Frontend-engineer 후행
- UI만 변경 시: Frontend-engineer 직접 디스패치
- 에이전트 프로필(`docs/agents/*.md`)의 디스패치 템플릿 활용

### 5단계: 검증
- 구현 완료 후 QA-engineer + Reviewer **병렬 디스패치**
- QA: 테스트 작성/실행
- Reviewer: 코드 리뷰

### 6단계: 보고
- 작업 결과 요약 (구현 내용, 변경 파일, 테스트 결과, 리뷰 결과)
- 커밋 필요 시 사용자에게 확인
