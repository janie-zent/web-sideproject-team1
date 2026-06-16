// GET /api/v1/tax-schedules?year=&month= — 캘린더용 세무 일정(읽기전용)
import * as taxService from '@/backend/tax/services/tax.service'
import { ok, fail, handleError, requireAuth } from '@/backend/shared/http'

export const runtime = 'nodejs'

// year/month 쿼리를 정수로 파싱한다. 유효하지 않으면 null.
function parseYearMonth(url: string): { year: number; month: number } | null {
  const params = new URL(url).searchParams
  const year = Number(params.get('year'))
  const month = Number(params.get('month'))
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null
  }
  return { year, month }
}

export async function GET(request: Request) {
  try {
    requireAuth(request)
    const parsed = parseYearMonth(request.url)
    if (parsed === null) {
      return fail('year와 month(1~12)를 올바르게 입력해주세요', 400)
    }
    const data = await taxService.listByMonth(parsed.year, parsed.month)
    return ok({ data })
  } catch (error) {
    return handleError(error)
  }
}
