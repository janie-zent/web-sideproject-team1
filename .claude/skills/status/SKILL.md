---
name: status
description: 프로젝트 현황 확인 (git status + recent commits)
user-invocable: true
---

# /status — 프로젝트 현황

## 워크플로우

### 확인 항목

1. **Git 상태**
```bash
git status
```

2. **최근 커밋**
```bash
git log --oneline -10
```

3. **현재 브랜치**
```bash
git branch --show-current
```

4. **커밋되지 않은 변경사항**
```bash
git diff --stat
```

5. **최근 작업 요약**
- 변경된 파일 목록
- 영역별 변경 범위

### 보고 형식

```
## 프로젝트 현황

- 브랜치: {현재 브랜치}
- 상태: {clean / 변경사항 있음}
- 최근 커밋: {최근 5개 커밋 요약}
- 미커밋 변경: {변경 파일 수 + 영향 범위}
```
