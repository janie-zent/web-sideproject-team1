// 관리자 비즈니스 로직 계층 (service) — 전부 더미 (DB 미반영)
// Repository/Prisma 없이 admin.mock.ts 상수를 가공해 반환한다.
import { MEMBERS, TAX_MASTER, SENT } from '../admin.mock'
import type {
  MemberDto,
  AdminTaxScheduleDto,
  AdminTaxScheduleInput,
  SentDto,
  SendInput,
  DashboardDto,
  MonthlySentDto,
  UpcomingTaxDto,
} from '../admin.types'

// 최근 6개월 발송 추이 (더미). 디자인 차트용 — 6월 기준 과거 6개월 카운트.
const MONTHLY_SENT: MonthlySentDto[] = [
  { month: '2026-01', count: 3 },
  { month: '2026-02', count: 4 },
  { month: '2026-03', count: 6 },
  { month: '2026-04', count: 5 },
  { month: '2026-05', count: 7 },
  { month: '2026-06', count: SENT.length },
]

// 대시보드 통계 + 차트 + 예정 일정 미리보기를 조립한다.
export function getDashboard(): DashboardDto {
  // 평균 확인율 = 총 읽음 / 총 발송대상 (한 번의 순회로 합산)
  let totalRecipients = 0
  let totalRead = 0
  for (const sent of SENT) {
    totalRecipients += sent.recipients
    totalRead += sent.read
  }
  const avgReadRate =
    totalRecipients === 0 ? 0 : Math.round((totalRead / totalRecipients) * 1000) / 10

  // 예정 세무일정 미리보기: 마스터 상위 4건
  const upcoming: UpcomingTaxDto[] = TAX_MASTER.slice(0, 4).map((tax) => ({
    id: tax.id,
    cat: tax.cat,
    title: tax.title,
    period: tax.period,
  }))

  return {
    stats: {
      totalMembers: MEMBERS.length,
      totalTaxSchedules: TAX_MASTER.length,
      totalSent: SENT.length,
      avgReadRate,
    },
    monthlySent: MONTHLY_SENT,
    upcoming,
  }
}

// 세무일정 마스터 목록 (관리자 화면용 — 더미)
export function listTaxSchedules(): AdminTaxScheduleDto[] {
  return TAX_MASTER
}

// 세무일정 등록 (더미 — DB 미반영, 받은 값을 echo)
export function createTaxSchedule(input: AdminTaxScheduleInput): AdminTaxScheduleDto {
  return {
    id: `t${Date.now()}`,
    cat: input.cat ?? 'vat',
    title: input.title ?? '',
    period: input.period ?? '',
    source: input.source ?? 'manual',
    cycle: input.cycle ?? '',
    updated: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
  }
}

// 세무일정 수정 (더미 — DB 미반영, id + 받은 값을 echo)
export function updateTaxSchedule(id: string, input: AdminTaxScheduleInput): AdminTaxScheduleDto {
  return {
    id,
    cat: input.cat ?? 'vat',
    title: input.title ?? '',
    period: input.period ?? '',
    source: input.source ?? 'manual',
    cycle: input.cycle ?? '',
    updated: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
  }
}

// 회원 목록/검색 (더미). q로 이름 또는 사업자명을 부분 일치 필터.
export function listMembers(query: string): MemberDto[] {
  const keyword = query.trim().toLowerCase()
  if (!keyword) {
    return MEMBERS
  }
  return MEMBERS.filter(
    (member) =>
      member.name.toLowerCase().includes(keyword) || member.biz.toLowerCase().includes(keyword),
  )
}

// 발송 알림 내역 (더미)
export function listSent(): SentDto[] {
  return SENT
}

// 알림 발송 (더미 — 실제 발송/저장 없음, 접수 결과만 echo)
export function sendNotification(input: SendInput): SentDto {
  return {
    id: `s${Date.now()}`,
    title: input.title ?? '',
    cat: input.cat ?? 'vat',
    recipients: MEMBERS.length,
    read: 0,
    channel: input.channel ?? '앱',
    sent: new Date().toISOString().slice(0, 16).replace('T', ' '),
  }
}
