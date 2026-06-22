// GET    /api/v1/events/[id] — 단건 조회
// PATCH  /api/v1/events/[id] — 수정
// DELETE /api/v1/events/[id] — 삭제
import * as eventService from '@/backend/events/services/event.service'
import { ok, fail, handleError, requireAuth } from '@/backend/shared/http'
import type { UpdateEventInput } from '@/backend/events/event.types'

export const runtime = 'nodejs'

// 경로 파라미터 id를 정수로 파싱한다.
// EventDto.id는 'p123' 형태이므로 선택적 'p' 접두어를 허용해 숫자만 추출한다.
function parseId(raw: string): number | null {
  const numeric = raw.startsWith('p') ? raw.slice(1) : raw
  const parsed = Number(numeric)
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
      return fail('유효하지 않은 일정 id입니다', 400)
    }
    const data = await eventService.getEvent(id)
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
      return fail('유효하지 않은 일정 id입니다', 400)
    }
    const body = (await request.json()) as UpdateEventInput
    const data = await eventService.updateEvent(id, body)
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
      return fail('유효하지 않은 일정 id입니다', 400)
    }
    await eventService.deleteEvent(id)
    return ok({})
  } catch (error) {
    return handleError(error)
  }
}
