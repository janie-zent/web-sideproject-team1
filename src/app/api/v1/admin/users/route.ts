// GET  /api/v1/admin/users — 사용자 목록
// POST /api/v1/admin/users — 사용자 생성
import * as userService from '@/backend/users/services/user.service'
import { ok, fail, handleError, requireAuth } from '@/backend/shared/http'
import type { CreateUserInput } from '@/backend/users/user.types'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    requireAuth(request)
    const data = await userService.listUsers()
    return ok({ data })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: Request) {
  try {
    requireAuth(request)
    const body = (await request.json()) as Partial<CreateUserInput>
    if (!body.username || !body.password) {
      return fail('아이디와 비밀번호를 입력해주세요', 400)
    }
    const data = await userService.createUser({
      username: body.username,
      password: body.password,
      name: body.name,
    })
    return ok({ data }, 201)
  } catch (error) {
    return handleError(error)
  }
}
