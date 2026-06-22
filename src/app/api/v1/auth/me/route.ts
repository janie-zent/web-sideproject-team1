// GET /api/v1/auth/me — 토큰 검증 후 내 계정 정보
import * as authService from '@/backend/auth/services/auth.service'
import { ok, handleError, requireAuth } from '@/backend/shared/http'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    // 실제 토큰 서명 검증 (미들웨어는 형식만 확인)
    const payload = requireAuth(request)
    const data = await authService.getMe(payload.sub)
    return ok({ data })
  } catch (error) {
    return handleError(error)
  }
}
