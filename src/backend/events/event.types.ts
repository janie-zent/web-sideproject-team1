// 일정 도메인 타입 단일 출처.
// EventDto/CategoryKey는 개인 일정(events)과 세무 일정(tax) 양 도메인의 공통 계약이므로
// 이 파일에서 정의하고 tax 도메인은 import만 한다 (타입 단일 출처).

// 카테고리 키 (세무 5종 + 개인)
export type CategoryKey = 'vat' | 'with' | 'income' | 'corp' | 'insure' | 'personal'

// 캘린더 표시용 일정 DTO (개인=실제, 세무=읽기전용 공통 표현)
// id는 source 접두어를 붙여 문자열로 변환한다 (개인 p123, 세무 t1) — 두 목록 병합 시 충돌 방지.
export interface EventDto {
  id: string
  source: 'personal' | 'tax'
  cat: CategoryKey
  title: string
  startDate: string // ISO yyyy-mm-dd
  endDate: string | null
  time: string | null
  allday: boolean
  done: boolean
  desc: string | null
  editable: boolean // personal=true, tax=false
}

// 내부 엔티티 (Prisma PersonalEvent 1:1) — repository 계층에서 다룬다.
export interface PersonalEvent {
  id: number
  cat: string
  title: string
  startDate: string
  endDate: string | null
  time: string | null
  allday: boolean
  done: boolean
  memo: string | null
  remindOn: boolean
  remindAt: string | null
  createdAt: Date
  updatedAt: Date
}

// 개인 일정 생성 입력
export interface CreateEventInput {
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

// 개인 일정 수정 입력 (전달된 필드만 반영)
export interface UpdateEventInput {
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
