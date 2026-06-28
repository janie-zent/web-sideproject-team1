// POST /api/v1/admin/users/login — 로그인
// route는 service만 import 한다 (repository/prisma 직접 호출 금지).
import { NextResponse } from 'next/server'
import * as userService from '@/backend/users/services/user.service'
import { fail, handleError } from '@/backend/shared/http'
import type { LoginInput } from '@/backend/users/user.types'

// jsonwebtoken/bcrypt/prisma는 Edge 비호환 → Node 런타임 강제
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<LoginInput>
    if (!body.username || !body.password) {
      return fail('아이디와 비밀번호를 입력해주세요', 400)
    }
    const token = await userService.login({
      username: body.username,
      password: body.password,
    })

    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    )

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 1일
      path: '/',
    })

    return response
  } catch (error) {
    return handleError(error)
  }
}
