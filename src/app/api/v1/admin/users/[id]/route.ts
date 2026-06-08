// GET    /api/v1/admin/users/[id] — 단건 조회
// PATCH  /api/v1/admin/users/[id] — 수정
// DELETE /api/v1/admin/users/[id] — 삭제
import * as userService from '@/backend/users/services/user.service'
import { ok, fail, handleError, requireAuth } from '@/backend/shared/http'
import type { UpdateUserInput } from '@/backend/users/user.types'

export const runtime = 'nodejs'

// 경로 파라미터 id를 정수로 파싱한다. 유효하지 않으면 null.
function parseId(raw: string): number | null {
  const parsed = Number(raw)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null
  }
  return parsed
}

interface RouteContext {
  params: { id: string }
}

export async function GET(request: Request, context: RouteContext) {
  try {
    requireAuth(request)
    const id = parseId(context.params.id)
    if (id === null) {
      return fail('유효하지 않은 사용자 id입니다', 400)
    }
    const data = await userService.getUser(id)
    return ok({ data })
  } catch (error) {
    return handleError(error)
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    requireAuth(request)
    const id = parseId(context.params.id)
    if (id === null) {
      return fail('유효하지 않은 사용자 id입니다', 400)
    }
    const body = (await request.json()) as UpdateUserInput
    const data = await userService.updateUser(id, {
      name: body.name,
      password: body.password,
    })
    return ok({ data })
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    requireAuth(request)
    const id = parseId(context.params.id)
    if (id === null) {
      return fail('유효하지 않은 사용자 id입니다', 400)
    }
    await userService.deleteUser(id)
    return ok({})
  } catch (error) {
    return handleError(error)
  }
}
