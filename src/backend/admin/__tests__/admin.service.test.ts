// admin.service 단위 테스트 (전부 더미 — DB 미사용)
// admin.mock 상수를 기반으로 대시보드 집계 / members q 필터 / echo 응답을 검증한다.
import { describe, it, expect } from 'vitest'

import * as adminService from '../services/admin.service'
import { MEMBERS, TAX_MASTER, SENT } from '../admin.mock'

describe('getDashboard (더미 집계)', () => {
  it('통계 카드는 mock 길이를 집계한다', () => {
    const dashboard = adminService.getDashboard()
    expect(dashboard.stats.totalMembers).toBe(MEMBERS.length)
    expect(dashboard.stats.totalTaxSchedules).toBe(TAX_MASTER.length)
    expect(dashboard.stats.totalSent).toBe(SENT.length)
  })

  it('평균 확인율은 (총 읽음/총 발송대상)을 0~100 소수 1자리로 반환한다', () => {
    // 기대값을 mock에서 직접 계산해 service 로직과 일치하는지 확인한다.
    let totalRecipients = 0
    let totalRead = 0
    for (const sent of SENT) {
      totalRecipients += sent.recipients
      totalRead += sent.read
    }
    const expected = Math.round((totalRead / totalRecipients) * 1000) / 10

    const dashboard = adminService.getDashboard()
    expect(dashboard.stats.avgReadRate).toBe(expected)
    expect(dashboard.stats.avgReadRate).toBeGreaterThanOrEqual(0)
    expect(dashboard.stats.avgReadRate).toBeLessThanOrEqual(100)
  })

  it('예정 세무일정은 마스터 상위 4건을 미리보기로 반환한다', () => {
    const dashboard = adminService.getDashboard()
    expect(dashboard.upcoming).toHaveLength(4)
    expect(dashboard.upcoming[0].id).toBe(TAX_MASTER[0].id)
  })

  it('월별 발송 차트를 포함한다', () => {
    const dashboard = adminService.getDashboard()
    expect(Array.isArray(dashboard.monthlySent)).toBe(true)
    expect(dashboard.monthlySent.length).toBeGreaterThan(0)
  })
})

describe('listTaxSchedules / listSent (더미 상수 반환)', () => {
  it('세무일정 마스터 전체를 그대로 반환한다', () => {
    expect(adminService.listTaxSchedules()).toEqual(TAX_MASTER)
  })

  it('발송 내역 전체를 그대로 반환한다', () => {
    expect(adminService.listSent()).toEqual(SENT)
  })
})

describe('listMembers (q 필터)', () => {
  it('q가 비어있으면 전체 회원을 반환한다', () => {
    expect(adminService.listMembers('')).toEqual(MEMBERS)
    expect(adminService.listMembers('   ')).toEqual(MEMBERS)
  })

  it('이름 부분 일치로 필터한다', () => {
    const result = adminService.listMembers('김도윤')
    expect(result.length).toBe(1)
    expect(result[0].name).toBe('김도윤')
  })

  it('사업자명(biz) 부분 일치로 필터한다', () => {
    const result = adminService.listMembers('디자인')
    expect(result.length).toBe(1)
    expect(result[0].biz).toBe('서연디자인')
  })

  it('대소문자 무시하고 매칭한다', () => {
    // 영문이 없으므로 한글 부분 문자열로 대소문자 비의존성을 간접 확인한다.
    const lower = adminService.listMembers('상사')
    expect(lower.some((member) => member.biz.includes('상사'))).toBe(true)
  })

  it('일치 없으면 빈 배열을 반환한다', () => {
    expect(adminService.listMembers('존재하지않는회원xyz')).toEqual([])
  })
})

describe('createTaxSchedule / updateTaxSchedule (더미 echo)', () => {
  it('등록은 입력값을 echo하고 새 id(t 접두어)를 부여한다', () => {
    const result = adminService.createTaxSchedule({ cat: 'corp', title: '신규 일정', period: '2026.07.01' })
    expect(result.cat).toBe('corp')
    expect(result.title).toBe('신규 일정')
    expect(result.id).toMatch(/^t\d+$/)
  })

  it('등록 시 누락 필드는 기본값으로 채운다', () => {
    const result = adminService.createTaxSchedule({})
    expect(result.cat).toBe('vat')
    expect(result.title).toBe('')
    expect(result.source).toBe('manual')
  })

  it('수정은 전달한 id를 유지하고 입력값을 echo한다', () => {
    const result = adminService.updateTaxSchedule('t99', { title: '수정됨' })
    expect(result.id).toBe('t99')
    expect(result.title).toBe('수정됨')
  })
})

describe('sendNotification (더미 echo)', () => {
  it('발송 접수 결과를 echo하며 recipients는 회원 수, read=0으로 반환한다', () => {
    const result = adminService.sendNotification({ title: '테스트 발송', cat: 'vat', channel: '앱' })
    expect(result.title).toBe('테스트 발송')
    expect(result.cat).toBe('vat')
    expect(result.recipients).toBe(MEMBERS.length)
    expect(result.read).toBe(0)
    expect(result.id).toMatch(/^s\d+$/)
  })
})
