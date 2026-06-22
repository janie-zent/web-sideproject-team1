// PATCH /api/v1/notifications/[id] — 단건 알림 상태 변경 (body { unread: boolean })
import * as notificationService from '@/backend/notifications/services/notification.service'
import { ok, fail, handleError, requireAuth } from '@/backend/shared/http'

export const runtime = 'nodejs'

// 경로 파라미터 id를 정수로 파싱한다. NotificationDto.id는 'n1' 형태이므로 'n' 접두어를 허용한다.
function parseId(raw: string): number | null {
  const numeric = raw.startsWith('n') ? raw.slice(1) : raw
  const parsed = Number(numeric)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null
  }
  return parsed
}

interface RouteContext {
  params: { id: string }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    requireAuth(request)
    const id = parseId(context.params.id)
    if (id === null) {
      return fail('유효하지 않은 알림 id입니다', 400)
    }
    // body의 unread(boolean)로 상태를 갱신한다. 누락/형식 오류 시 400.
    const body = (await request.json().catch(() => null)) as { unread?: unknown } | null
    if (!body || typeof body.unread !== 'boolean') {
      return fail('unread(boolean) 필드가 필요합니다', 400)
    }
    const data = await notificationService.readNotification(id, body.unread)
    return ok({ data })
  } catch (error) {
    return handleError(error)
  }
}
