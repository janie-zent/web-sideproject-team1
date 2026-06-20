---
name: review
description: 코드 리뷰 (Reviewer 디스패치 → 리뷰 결과 보고)
user-invocable: true
---

# /review — 코드 리뷰

## 워크플로우

### 1단계: 리뷰 대상 파악
- `git diff` 또는 사용자 지정 범위로 리뷰 대상 확인
- 변경된 파일 목록 정리

### 2단계: Reviewer 디스패치
- `docs/agents/reviewer.md`의 디스패치 템플릿 활용
- 리뷰 대상 파일과 변경 내용 전달

### 3단계: 리뷰 결과 보고
- Reviewer의 분석 결과를 사용자에게 전달
- 심각도별 정리: Critical / Warning / Info
- 필요 시 추가 수정 작업 디스패치

### 검증 항목
1. 코드 품질 (패턴 준수, 가독성)
2. 예외 상황/경계값 처리
3. 보안 취약점
4. 성능 이슈
5. 코드 스타일 규칙 준수
