// 애플리케이션 도메인 에러
// service 계층에서 비즈니스 규칙 위반 시 던지고, route 계층(http 헬퍼)에서 응답으로 변환한다.
export class AppError extends Error {
  // 에러 식별 코드 (예: 'INVALID_CREDENTIALS', 'USER_NOT_FOUND')
  readonly code: string
  // HTTP 상태 코드
  readonly status: number

  constructor(code: string, status: number, message: string) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = status
  }
}
