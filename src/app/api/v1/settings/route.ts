// GET   /api/v1/settings — 설정 조회
// PATCH /api/v1/settings — 설정 부분 수정
import * as settingsService from '@/backend/settings/services/settings.service'
import { ok, handleError, requireAuth } from '@/backend/shared/http'
import type { UpdateSettingsInput } from '@/backend/settings/settings.types'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    requireAuth(request)
    const data = await settingsService.getSettings()
    return ok({ data })
  } catch (error) {
    return handleError(error)
  }
}

export async function PATCH(request: Request) {
  try {
    requireAuth(request)
    const body = (await request.json()) as UpdateSettingsInput
    const data = await settingsService.updateSettings(body)
    return ok({ data })
  } catch (error) {
    return handleError(error)
  }
}
