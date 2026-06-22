// GET  /api/v1/admin/tax-schedules — 세무일정 마스터 목록 (더미)
// POST /api/v1/admin/tax-schedules — 등록 (더미 성공 응답, DB 미반영)
import * as adminService from '@/backend/admin/services/admin.service'
import { ok, handleError, requireAuth } from '@/backend/shared/http'
import type { AdminTaxScheduleInput } from '@/backend/admin/admin.types'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    requireAuth(request)
    const data = adminService.listTaxSchedules()
    return ok({ data })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: Request) {
  try {
    requireAuth(request)
    const body = (await request.json()) as AdminTaxScheduleInput
    const data = adminService.createTaxSchedule(body)
    return ok({ data }, 201)
  } catch (error) {
    return handleError(error)
  }
}
