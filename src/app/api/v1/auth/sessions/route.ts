// POST   /api/v1/auth/sessions — 세션 생성(로그인). 이메일/비밀번호 → JWT 발급
// DELETE /api/v1/auth/sessions — 세션 폐기(로그아웃)
// route는 service만 import 한다 (repository/prisma 직접 호출 금지).
import * as authService from '@/backend/auth/services/auth.service'
import { ok, fail, handleError, requireAuth } from '@/backend/shared/http'
import type { LoginInput } from '@/backend/auth/auth.types'

// jsonwebtoken/bcrypt/prisma는 Edge 비호환 → Node 런타임 강제
export const runtime = 'nodejs'

// 세션 생성: 자격 검증 후 토큰 발급 (기존 login 로직 그대로)
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<LoginInput>
    if (!body.email || !body.password) {
      return fail('이메일과 비밀번호를 입력해주세요', 400)
    }
    const token = await authService.login({
      email: body.email,
      password: body.password,
    })
    return ok({ token })
  } catch (error) {
    return handleError(error)
  }
}

// 세션 폐기(로그아웃)
// stateless 로그아웃 — JWT는 무상태이므로 서버 상태 변경 없이 토큰 검증만 수행한다.
// 토큰 폐기는 클라이언트 책임(저장소에서 토큰 삭제).
export async function DELETE(request: Request) {
  try {
    // 인증된 사용자만 로그아웃 가능 — 토큰 서명 검증
    requireAuth(request)
    return ok({})
  } catch (error) {
    return handleError(error)
  }
}
