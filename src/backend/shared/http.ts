// HTTP 응답 헬퍼 + 인증 헬퍼
// route 계층에서 일관된 응답 포맷({ result, ... })을 만들고, 토큰 서명 검증을 수행한다.
import { NextResponse } from 'next/server'
import { AppError } from './errors'
import { verifyToken } from './jwt'
import type { JwtPayload } from '../users/user.types'

// 성공 응답: { result: true, ...data }
export function ok<T extends Record<string, unknown>>(data: T, status = 200): NextResponse {
  return NextResponse.json({ result: true, ...data }, { status })
}

// 실패 응답: { result: false, message }
export function fail(message: string, status = 400): NextResponse {
  return NextResponse.json({ result: false, message }, { status })
}

// service 등에서 던진 에러를 응답으로 변환한다.
export function handleError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return fail(error.message, error.status)
  }
  return fail('서버 오류가 발생했습니다', 500)
}

// Authorization 헤더에서 Bearer 토큰을 추출하고 서명을 검증한다.
// 실패 시 401 AppError를 던진다. (미들웨어는 형식만 검사하므로 실제 검증은 여기서 한다.)
export function requireAuth(request: Request): JwtPayload {
  const header = request.headers.get('authorization') ?? ''
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) {
    throw new AppError('UNAUTHORIZED', 401, '인증 토큰이 필요합니다')
  }
  return verifyToken(token)
}
