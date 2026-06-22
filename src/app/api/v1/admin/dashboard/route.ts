// GET /api/v1/admin/dashboard — 통계 카드 + 월별 발송 차트 + 예정 일정 (더미)
import * as adminService from '@/backend/admin/services/admin.service'
import { ok, handleError, requireAuth } from '@/backend/shared/http'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    requireAuth(request)
    const data = adminService.getDashboard()
    return ok({ data })
  } catch (error) {
    return handleError(error)
  }
}
