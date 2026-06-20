# 디스패치 프로토콜

## 전제 조건
- **`plans/*.md` 승인 후에만 디스패치** (긴급 버그 수정 등 사용자 명시적 요청 제외)
- Task 도구를 사용하여 팀원에게 작업 할당

## 디스패치 패턴

### 1. UI + DB 변경
```
Backend-engineer (선행) → Frontend-engineer (후행) → QA + Reviewer (병렬)
```
- Backend-engineer가 DB 스키마, API, Dexie 스키마 완료
- Frontend-engineer가 UI 컴포넌트 작업 (이미 준비된 데이터 활용)
- QA와 Reviewer는 구현 완료 후 병렬로 검증

### 2. UI만 변경
```
Frontend-engineer → QA + Reviewer (병렬)
```

### 3. Electron IPC 변경
```
Backend/Frontend (데이터 준비) → Electron-engineer → QA + Reviewer (병렬)
```

### 4. 테스트만
```
QA-engineer 단독
```

## 프롬프트 필수 포함 사항

모든 디스패치 프롬프트에 다음을 반드시 포함:

1. **작업 디렉토리**: 정확한 경로 (예: `src/app/`, `src/backend/`, `electron/`)
2. **대상 영역명**: 명확한 식별자 (예: Frontend, Backend, Electron)
3. **구체적 작업 내용**: 무엇을 구현/수정할지
4. **관련 파일**: 참고해야 할 기존 코드 경로
5. **의존성 정보**: 선행 작업 결과, 변경된 API 등
6. **기술 스택 리마인더**: 해당 영역의 주요 기술

## 작업물 검증 (필수)

모든 구현 작업(Backend-engineer, Frontend-engineer, Electron-engineer) 완료 후 반드시 검증 단계를 거친다:

1. **Reviewer 디스패치**: 변경된 코드에 대해 리뷰 요청
2. **QA-engineer 디스패치**: 테스트 작성/실행으로 품질 검증
3. Reviewer와 QA-engineer는 **병렬로 디스패치** 가능
4. 검증 결과에 Critical 이슈가 있으면 해당 엔지니어에게 **수정 재디스패치**
5. 모든 검증 통과 후 사용자에게 보고

## 디스패치 시 주의사항
- 팀원 에이전트 프로필(`docs/agents/*.md`)의 디스패치 템플릿을 활용
- 팀원에게 커밋을 요청하지 않음 (Team Lead가 확인 후 결정)
- 불확실한 사항은 명시적으로 표시하고, 사용자에게 확인
