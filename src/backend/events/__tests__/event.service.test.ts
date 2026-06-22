// event.service 단위 테스트
// event.repository를 mock하여 service 비즈니스 로직(id 접두어 변환, 부분 업데이트, 월 범위)만 검증한다.
import { describe, it, expect, beforeEach, vi } from 'vitest'

// repository 계층 전체를 mock으로 대체한다.
vi.mock('../repositories/event.repository', () => ({
  findByMonth: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}))

import * as eventRepository from '../repositories/event.repository'
import * as eventService from '../services/event.service'
import type { PersonalEvent } from '../event.types'

const mockedRepo = vi.mocked(eventRepository)

// 테스트용 PersonalEvent 엔티티 팩토리
function buildEvent(overrides: Partial<PersonalEvent> = {}): PersonalEvent {
  return {
    id: 1,
    cat: 'personal',
    title: '거래처 입금 확인',
    startDate: '2026-06-10',
    endDate: null,
    time: '11:00',
    allday: false,
    done: false,
    memo: '메모',
    remindOn: false,
    remindAt: null,
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    updatedAt: new Date('2026-06-01T00:00:00.000Z'),
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('listByMonth', () => {
  it('월의 시작/끝 범위(01~31)로 repository를 호출하고 EventDto[]를 반환한다', async () => {
    mockedRepo.findByMonth.mockResolvedValue([buildEvent({ id: 5 }), buildEvent({ id: 6 })])

    const list = await eventService.listByMonth(2026, 6)

    // 월 범위는 사전식 비교용 '-01' ~ '-31'
    expect(mockedRepo.findByMonth).toHaveBeenCalledWith('2026-06-01', '2026-06-31')
    expect(list).toHaveLength(2)
    expect(list[0].id).toBe('p5')
    expect(list[1].id).toBe('p6')
  })

  it('한 자리 월은 0 패딩하여 범위를 만든다', async () => {
    mockedRepo.findByMonth.mockResolvedValue([])
    await eventService.listByMonth(2026, 3)
    expect(mockedRepo.findByMonth).toHaveBeenCalledWith('2026-03-01', '2026-03-31')
  })
})

describe('getEvent (id 접두어 변환)', () => {
  it('개인 일정 id에 p 접두어를 붙이고 source/editable/desc(memo)를 매핑한다', async () => {
    mockedRepo.findById.mockResolvedValue(buildEvent({ id: 42, memo: '상세 메모' }))

    const dto = await eventService.getEvent(42)

    expect(dto.id).toBe('p42')
    expect(dto.source).toBe('personal')
    expect(dto.editable).toBe(true)
    // memo는 desc로 매핑된다.
    expect(dto.desc).toBe('상세 메모')
  })

  it('없는 id면 404 EVENT_NOT_FOUND', async () => {
    mockedRepo.findById.mockResolvedValue(null)
    await expect(eventService.getEvent(999)).rejects.toMatchObject({
      status: 404,
      code: 'EVENT_NOT_FOUND',
    })
  })
})

describe('createEvent', () => {
  it('미전달 옵션 필드를 기본값(null/false)으로 정규화하여 repository에 전달한다', async () => {
    mockedRepo.create.mockImplementation(async (data) => buildEvent({ id: 10, ...data }))

    const dto = await eventService.createEvent({ title: '신규', startDate: '2026-06-20' })

    const createArg = mockedRepo.create.mock.calls[0][0]
    expect(createArg.endDate).toBeNull()
    expect(createArg.time).toBeNull()
    expect(createArg.allday).toBe(false)
    expect(createArg.done).toBe(false)
    expect(createArg.memo).toBeNull()
    expect(createArg.remindOn).toBe(false)
    expect(createArg.remindAt).toBeNull()
    expect(dto.id).toBe('p10')
  })

  it('전달된 값은 그대로 repository에 전달한다', async () => {
    mockedRepo.create.mockImplementation(async (data) => buildEvent({ id: 11, ...data }))

    await eventService.createEvent({
      title: '멀티데이',
      startDate: '2026-06-08',
      endDate: '2026-06-14',
      allday: true,
      memo: '출장',
    })

    const createArg = mockedRepo.create.mock.calls[0][0]
    expect(createArg.endDate).toBe('2026-06-14')
    expect(createArg.allday).toBe(true)
    expect(createArg.memo).toBe('출장')
  })
})

describe('updateEvent (부분 업데이트)', () => {
  it('없는 id면 404 EVENT_NOT_FOUND (수정 시도 안 함)', async () => {
    mockedRepo.findById.mockResolvedValue(null)
    await expect(eventService.updateEvent(999, { title: 'x' })).rejects.toMatchObject({
      status: 404,
      code: 'EVENT_NOT_FOUND',
    })
    expect(mockedRepo.update).not.toHaveBeenCalled()
  })

  it('전달된 필드만 update 데이터에 포함한다 (undefined 필드 제외)', async () => {
    mockedRepo.findById.mockResolvedValue(buildEvent({ id: 5 }))
    mockedRepo.update.mockImplementation(async (id, data) => buildEvent({ id, ...data }))

    await eventService.updateEvent(5, { done: true })

    const updateArg = mockedRepo.update.mock.calls[0][1]
    expect(updateArg).toEqual({ done: true })
    // title 등은 전달하지 않았으므로 포함되면 안 된다.
    expect(updateArg).not.toHaveProperty('title')
    expect(updateArg).not.toHaveProperty('startDate')
  })

  it('null을 명시적으로 전달하면 update에 null로 포함한다 (undefined와 구분)', async () => {
    mockedRepo.findById.mockResolvedValue(buildEvent({ id: 5 }))
    mockedRepo.update.mockImplementation(async (id, data) => buildEvent({ id, ...data }))

    await eventService.updateEvent(5, { time: null })

    const updateArg = mockedRepo.update.mock.calls[0][1]
    expect(updateArg).toHaveProperty('time', null)
  })
})

describe('deleteEvent', () => {
  it('없는 id면 404 EVENT_NOT_FOUND (삭제 시도 안 함)', async () => {
    mockedRepo.findById.mockResolvedValue(null)
    await expect(eventService.deleteEvent(999)).rejects.toMatchObject({
      status: 404,
      code: 'EVENT_NOT_FOUND',
    })
    expect(mockedRepo.remove).not.toHaveBeenCalled()
  })

  it('존재하면 repository.remove를 호출하고 void를 반환한다', async () => {
    mockedRepo.findById.mockResolvedValue(buildEvent({ id: 8 }))
    mockedRepo.remove.mockResolvedValue(buildEvent({ id: 8 }))

    const result = await eventService.deleteEvent(8)

    expect(result).toBeUndefined()
    expect(mockedRepo.remove).toHaveBeenCalledWith(8)
  })
})
