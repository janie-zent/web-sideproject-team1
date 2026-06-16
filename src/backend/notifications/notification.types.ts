// 알림 도메인 타입 단일 출처.
import type { CategoryKey } from '../events/event.types'

// 내부 엔티티 (Prisma Notification 1:1) — repository 계층에서 다룬다.
export interface Notification {
  id: number
  cat: string
  title: string
  body: string
  when: string
  unread: boolean
  createdAt: Date
}

// 응답 DTO — id는 'n' 접두어를 붙여 문자열로 변환한다 (목업 id 'n1' 호환).
export interface NotificationDto {
  id: string
  cat: CategoryKey
  title: string
  body: string
  when: string
  unread: boolean
}

// 목록 필터
export type NotificationFilter = 'all' | 'unread'
