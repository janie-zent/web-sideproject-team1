// 인증/계정 도메인 타입 단일 출처.
// repository, service, route 모든 계층이 이 파일의 타입만 import 한다.

// 내부 엔티티 (password 포함) — repository 계층에서만 다룬다.
export interface Account {
  id: number
  email: string
  password: string // bcrypt 해시
  name: string | null
  bizName: string | null
  bizNo: string | null
  plan: string
  createdAt: Date
  updatedAt: Date
}

// 응답용 DTO — password 제외, 날짜는 ISO 문자열.
export interface AccountDto {
  id: number
  email: string
  name: string | null
  bizName: string | null
  bizNo: string | null
  plan: string
  createdAt: string
}

// 로그인 입력
export interface LoginInput {
  email: string
  password: string
}
