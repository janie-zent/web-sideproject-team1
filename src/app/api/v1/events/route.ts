// GET  /api/v1/events?year=&month= — 해당 월 개인 일정 목록
// POST /api/v1/events — 개인 일정 생성
import * as eventService from '@/backend/events/services/event.service'
import { ok, fail, handleError, requireAuth } from '@/backend/shared/http'
import type { CreateEventInput } from '@/backend/events/event.types'

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
    const data = await eventService.listByMonth(parsed.year, parsed.month)
    return ok({ data })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: Request) {
  try {
    requireAuth(request)
    const body = (await request.json()) as Partial<CreateEventInput>
    if (!body.title || !body.startDate) {
      return fail('제목과 시작일을 입력해주세요', 400)
    }
    const data = await eventService.createEvent({
      title: body.title,
      startDate: body.startDate,
      endDate: body.endDate,
      time: body.time,
      allday: body.allday,
      done: body.done,
      memo: body.memo,
      remindOn: body.remindOn,
      remindAt: body.remindAt,
    })
    return ok({ data }, 201)
  } catch (error) {
    return handleError(error)
  }
}
