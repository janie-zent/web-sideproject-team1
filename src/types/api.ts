// API 응답 공통 타입
export interface ApiResponse<T = unknown> {
  code?: string
  message?: string
  data?: T
  status?: number
}

// 로그인 응답
export interface LoginResponse {
  token: string
}

// 사용자 정보
export interface User {
  id: number
  username: string
  name: string | null
  createdAt: string
}
