// 개인 일정 데이터 접근 계층 (repository)
// prisma만 import 한다. 비즈니스 로직 금지 — 순수 CRUD만 수행.
import { prisma } from '../../shared/prisma'
import type { PersonalEvent } from '../event.types'

// 해당 월에 걸치는 일정 조회.
// startDate는 ISO yyyy-mm-dd 문자열이므로 [monthStart, monthEnd] 범위로 비교한다.
// 멀티데이 일정(endDate 보유)이 월 안으로 겹치는 경우까지 포함하기 위해 OR 조건을 사용한다.
export function findByMonth(monthStart: string, monthEnd: string): Promise<PersonalEvent[]> {
  return prisma.personalEvent.findMany({
    where: {
      OR: [
        // 시작일이 해당 월 안에 있는 경우
        { startDate: { gte: monthStart, lte: monthEnd } },
        // 종료일이 해당 월 안에 있는 경우 (월 이전에 시작한 멀티데이)
        { endDate: { gte: monthStart, lte: monthEnd } },
      ],
    },
    orderBy: [{ startDate: 'asc' }, { id: 'asc' }],
  })
}

// id로 단건 조회 (없으면 null)
export function findById(id: number): Promise<PersonalEvent | null> {
  return prisma.personalEvent.findUnique({ where: { id } })
}

// 생성 입력 (정규화된 값이 들어온다 — 기본값/검증은 service 책임)
interface CreateData {
  title: string
  startDate: string
  endDate?: string | null
  time?: string | null
  allday?: boolean
  done?: boolean
  memo?: string | null
  remindOn?: boolean
  remindAt?: string | null
}

// 개인 일정 생성
export function create(data: CreateData): Promise<PersonalEvent> {
  return prisma.personalEvent.create({ data })
}

// 수정 입력 (전달된 필드만)
interface UpdateData {
  title?: string
  startDate?: string
  endDate?: string | null
  time?: string | null
  allday?: boolean
  done?: boolean
  memo?: string | null
  remindOn?: boolean
  remindAt?: string | null
}

// 개인 일정 수정
export function update(id: number, data: UpdateData): Promise<PersonalEvent> {
  return prisma.personalEvent.update({ where: { id }, data })
}

// 개인 일정 삭제
export function remove(id: number): Promise<PersonalEvent> {
  return prisma.personalEvent.delete({ where: { id } })
}
