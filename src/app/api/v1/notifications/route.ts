// GET   /api/v1/notifications?filter=all|unread — 알림 목록
// PATCH /api/v1/notifications — 컬렉션 일괄 상태 변경 (모두 읽음)
import * as notificationService from '@/backend/notifications/services/notification.service'
import { ok, handleError, requireAuth } from '@/backend/shared/http'
import type { NotificationFilter } from '@/backend/notifications/notification.types'

export const runtime = 'nodejs'

// filter 쿼리를 파싱한다. 'unread'가 아니면 모두 'all'로 처리.
function parseFilter(url: string): NotificationFilter {
  const raw = new URL(url).searchParams.get('filter')
  return raw === 'unread' ? 'unread' : 'all'
}

export async function GET(request: Request) {
  try {
    requireAuth(request)
    const filter = parseFilter(request.url)
    const data = await notificationService.listNotifications(filter)
    return ok({ data })
  } catch (error) {
    return handleError(error)
  }
}

// 컬렉션 일괄 업데이트 — 모두 읽음 처리. { result: true, updated: n }
export async function PATCH(request: Request) {
  try {
    requireAuth(request)
    const updated = await notificationService.readAllNotifications()
    return ok({ updated })
  } catch (error) {
    return handleError(error)
  }
}
