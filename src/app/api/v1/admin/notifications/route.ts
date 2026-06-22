// GET  /api/v1/admin/notifications — 발송 알림 내역 (더미)
// POST /api/v1/admin/notifications — 알림 발송 (더미 성공 응답, 실제 발송/저장 없음)
import * as adminService from '@/backend/admin/services/admin.service'
import { ok, handleError, requireAuth } from '@/backend/shared/http'
import type { SendInput } from '@/backend/admin/admin.types'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    requireAuth(request)
    const data = adminService.listSent()
    return ok({ data })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: Request) {
  try {
    requireAuth(request)
    const body = (await request.json()) as SendInput
    const data = adminService.sendNotification(body)
    return ok({ data }, 201)
  } catch (error) {
    return handleError(error)
  }
}
