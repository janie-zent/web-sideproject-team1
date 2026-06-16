// 세무 일정 도메인 타입 단일 출처.
// EventDto/CategoryKey는 events 도메인이 정본이므로 import만 한다 (타입 단일 출처).
export type { EventDto, CategoryKey } from '../events/event.types'

// 내부 엔티티 (Prisma TaxSchedule 1:1) — repository 계층에서 다룬다.
export interface TaxSchedule {
  id: number
  cat: string
  title: string
  period: string
  source: string // 'api' | 'manual'
  cycle: string
  updated: string
  startDate: string | null // 캘린더 매핑용 ISO yyyy-mm-dd
  endDate: string | null
  createdAt: Date
}
