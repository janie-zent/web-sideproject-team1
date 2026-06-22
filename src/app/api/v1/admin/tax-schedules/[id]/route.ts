// PATCH /api/v1/admin/tax-schedules/[id] — 수정 (더미 성공 응답, DB 미반영)
import * as adminService from '@/backend/admin/services/admin.service'
import { ok, fail, handleError, requireAuth } from '@/backend/shared/http'
import type { AdminTaxScheduleInput } from '@/backend/admin/admin.types'

export const runtime = 'nodejs'

interface RouteContext {
  params: { id: string }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    requireAuth(request)
    const id = context.params.id
    if (!id) {
      return fail('세무일정 id가 필요합니다', 400)
    }
    const body = (await request.json()) as AdminTaxScheduleInput
    const data = adminService.updateTaxSchedule(id, body)
    return ok({ data })
  } catch (error) {
    return handleError(error)
  }
}
