// JWT 발급/검증 (jsonwebtoken, HS256)
// Node 런타임 전용 — Edge(미들웨어)에서는 사용 불가.
import jwt from 'jsonwebtoken'
import { AppError } from './errors'
import type { JwtPayload } from '../users/user.types'

// 토큰 만료 기간
const EXPIRES_IN = '1d'

// 서명 비밀키를 환경변수에서 읽는다. 없으면 부팅 시점에 명확히 실패시킨다.
function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new AppError('JWT_SECRET_MISSING', 500, 'JWT_SECRET 환경변수가 설정되지 않았습니다')
  }
  return secret
}

// 페이로드로 토큰을 발급한다.
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret(), { algorithm: 'HS256', expiresIn: EXPIRES_IN })
}

// 토큰을 검증하고 페이로드를 반환한다. 실패 시 401 AppError.
export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, getSecret(), { algorithms: ['HS256'] })
    // jsonwebtoken은 string | JwtPayload(object)를 반환할 수 있다.
    if (typeof decoded === 'string' || typeof decoded.sub !== 'number') {
      throw new AppError('INVALID_TOKEN', 401, '유효하지 않은 토큰입니다')
    }
    return { sub: decoded.sub, username: String(decoded.username) }
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError('INVALID_TOKEN', 401, '유효하지 않은 토큰입니다')
  }
}
