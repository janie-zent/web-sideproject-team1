// 개인 일정 비즈니스 로직 계층 (service)
// repository + shared(errors)만 import 한다. prisma 직접 호출 금지.
import * as eventRepository from '../repositories/event.repository'
import { AppError } from '../../shared/errors'
import type {
  PersonalEvent,
  EventDto,
  CategoryKey,
  CreateEventInput,
  UpdateEventInput,
} from '../event.types'

// 월의 시작/끝 ISO 날짜 문자열을 계산한다. (예 2026,6 → 2026-06-01 / 2026-06-31)
// 일(day) 비교는 문자열 사전식 비교이므로 끝값은 '-31'로 두면 해당 월 31일까지 포함된다.
function monthRange(year: number, month: number): { start: string; end: string } {
  const monthLabel = String(month).padStart(2, '0')
  return {
    start: `${year}-${monthLabel}-01`,
    end: `${year}-${monthLabel}-31`,
  }
}

// 내부 엔티티(PersonalEvent)를 응답용 EventDto로 변환한다. 단일 변환 지점.
// id는 'p' 접두어를 붙여 세무 일정과 충돌하지 않도록 문자열로 만든다.
function toDto(event: PersonalEvent): EventDto {
  return {
    id: `p${event.id}`,
    source: 'personal',
    cat: event.cat as CategoryKey,
    title: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    time: event.time,
    allday: event.allday,
    done: event.done,
    desc: event.memo,
    editable: true,
  }
}

// 해당 월의 개인 일정 목록 조회
export async function listByMonth(year: number, month: number): Promise<EventDto[]> {
  const { start, end } = monthRange(year, month)
  const events = await eventRepository.findByMonth(start, end)
  return events.map(toDto)
}

// 개인 일정 단건 조회
export async function getEvent(id: number): Promise<EventDto> {
  const event = await eventRepository.findById(id)
  if (!event) {
    throw new AppError('EVENT_NOT_FOUND', 404, '일정을 찾을 수 없습니다')
  }
  return toDto(event)
}

// 개인 일정 생성
export async function createEvent(input: CreateEventInput): Promise<EventDto> {
  const created = await eventRepository.create({
    title: input.title,
    startDate: input.startDate,
    endDate: input.endDate ?? null,
    time: input.time ?? null,
    allday: input.allday ?? false,
    done: input.done ?? false,
    memo: input.memo ?? null,
    remindOn: input.remindOn ?? false,
    remindAt: input.remindAt ?? null,
  })
  return toDto(created)
}

// 개인 일정 수정 (전달된 필드만 반영)
export async function updateEvent(id: number, input: UpdateEventInput): Promise<EventDto> {
  const existing = await eventRepository.findById(id)
  if (!existing) {
    throw new AppError('EVENT_NOT_FOUND', 404, '일정을 찾을 수 없습니다')
  }
  // undefined가 아닌 필드만 추려 부분 업데이트한다.
  const data: UpdateEventInput = {}
  const keys: (keyof UpdateEventInput)[] = [
    'title',
    'startDate',
    'endDate',
    'time',
    'allday',
    'done',
    'memo',
    'remindOn',
    'remindAt',
  ]
  for (const key of keys) {
    if (input[key] !== undefined) {
      // 동적 키 할당 — 타입은 위 keys로 좁혀져 있다.
      ;(data as Record<string, unknown>)[key] = input[key]
    }
  }
  const updated = await eventRepository.update(id, data)
  return toDto(updated)
}

// 개인 일정 삭제
export async function deleteEvent(id: number): Promise<void> {
  const existing = await eventRepository.findById(id)
  if (!existing) {
    throw new AppError('EVENT_NOT_FOUND', 404, '일정을 찾을 수 없습니다')
  }
  await eventRepository.remove(id)
}
