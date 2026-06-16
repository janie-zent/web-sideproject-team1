// tax.service 단위 테스트
// tax.repository를 mock하여 월 범위 필터 + 읽기전용 EventDto 변환(t 접두어, editable=false)을 검증한다.
import { describe, it, expect, beforeEach, vi } from 'vitest'

// repository 계층 전체를 mock으로 대체한다.
vi.mock('../repositories/tax.repository', () => ({
  findByMonth: vi.fn(),
  findAll: vi.fn(),
}))

import * as taxRepository from '../repositories/tax.repository'
import * as taxService from '../services/tax.service'
import type { TaxSchedule } from '../tax.types'

const mockedRepo = vi.mocked(taxRepository)

// 테스트용 TaxSchedule 엔티티 팩토리
function buildTax(overrides: Partial<TaxSchedule> = {}): TaxSchedule {
  return {
    id: 1,
    cat: 'with',
    title: '원천세 신고·납부',
    period: '매월 10일',
    source: 'api',
    cycle: '매월',
    updated: '2026.06.01',
    startDate: '2026-06-10',
    endDate: null,
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('listByMonth (월 조회 필터)', () => {
  it('월의 시작/끝 범위(01~31)로 repository를 호출한다', async () => {
    mockedRepo.findByMonth.mockResolvedValue([])
    await taxService.listByMonth(2026, 6)
    expect(mockedRepo.findByMonth).toHaveBeenCalledWith('2026-06-01', '2026-06-31')
  })

  it('한 자리 월은 0 패딩하여 범위를 만든다', async () => {
    mockedRepo.findByMonth.mockResolvedValue([])
    await taxService.listByMonth(2026, 7)
    expect(mockedRepo.findByMonth).toHaveBeenCalledWith('2026-07-01', '2026-07-31')
  })

  it('세무 일정은 t 접두어 + source=tax + editable=false로 변환한다', async () => {
    mockedRepo.findByMonth.mockResolvedValue([buildTax({ id: 2, cycle: '분기', period: '2026.06.25' })])

    const list = await taxService.listByMonth(2026, 6)

    expect(list).toHaveLength(1)
    const dto = list[0]
    expect(dto.id).toBe('t2')
    expect(dto.source).toBe('tax')
    expect(dto.editable).toBe(false)
    expect(dto.allday).toBe(true)
    expect(dto.time).toBeNull()
    // desc는 "cycle · period" 형태로 조립된다.
    expect(dto.desc).toBe('분기 · 2026.06.25')
  })

  it('startDate가 null이면 빈 문자열로 방어한다', async () => {
    mockedRepo.findByMonth.mockResolvedValue([buildTax({ id: 3, startDate: null })])
    const list = await taxService.listByMonth(2026, 6)
    expect(list[0].startDate).toBe('')
  })
})
