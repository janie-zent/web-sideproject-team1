// 세무 일정 데이터 접근 계층 (repository)
// prisma만 import 한다. 비즈니스 로직 금지 — 순수 CRUD만 수행. (회원은 읽기전용)
import { prisma } from '../../shared/prisma'
import type { TaxSchedule } from '../tax.types'

// 캘린더 매핑용 startDate가 해당 월 범위에 드는 세무 일정 조회.
// startDate가 null인 항목(특정일 없음)은 캘린더에 표시할 수 없으므로 제외한다.
export function findByMonth(monthStart: string, monthEnd: string): Promise<TaxSchedule[]> {
  return prisma.taxSchedule.findMany({
    where: {
      startDate: { gte: monthStart, lte: monthEnd },
    },
    orderBy: [{ startDate: 'asc' }, { id: 'asc' }],
  })
}

// 전체 목록 조회 (관리자용 — 더미가 아닌 실제 마스터 데이터)
export function findAll(): Promise<TaxSchedule[]> {
  return prisma.taxSchedule.findMany({ orderBy: { id: 'asc' } })
}
