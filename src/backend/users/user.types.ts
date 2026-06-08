// 사용자 도메인의 엔티티/DTO 타입 단일 출처.
// repository, service, route 모든 계층이 이 파일의 타입만 import 한다.

// 내부 엔티티 (password 포함) — repository 계층에서만 다룬다.
export interface User {
  id: number
  username: string
  password: string // bcrypt 해시
  name: string | null
  createdAt: Date
  updatedAt: Date
}

// 응답용 DTO — password 제외, 날짜는 ISO 문자열.
export interface UserDto {
  id: number
  username: string
  name: string | null
  createdAt: string
}

// 로그인 입력
export interface LoginInput {
  username: string
  password: string
}

// 사용자 생성 입력
export interface CreateUserInput {
  username: string
  password: string
  name?: string
}

// 사용자 수정 입력
export interface UpdateUserInput {
  name?: string
  password?: string
}

// JWT 페이로드
export interface JwtPayload {
  sub: number // 사용자 id
  username: string
}
