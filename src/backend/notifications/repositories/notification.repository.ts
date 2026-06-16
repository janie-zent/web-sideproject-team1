// 알림 데이터 접근 계층 (repository)
// prisma만 import 한다. 비즈니스 로직 금지 — 순수 CRUD만 수행.
import { prisma } from '../../shared/prisma'
import type { Notification } from '../notification.types'

// 전체 목록 조회 (최신순 — createdAt 내림차순, 동률은 id 내림차순)
export function findAll(): Promise<Notification[]> {
  return prisma.notification.findMany({ orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] })
}

// 읽지 않은 알림만 조회 (최신순)
export function findUnread(): Promise<Notification[]> {
  return prisma.notification.findMany({
    where: { unread: true },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  })
}

// id로 단건 조회 (없으면 null)
export function findById(id: number): Promise<Notification | null> {
  return prisma.notification.findUnique({ where: { id } })
}

// 단건 unread 상태 변경 (읽음=false)
export function setUnread(id: number, unread: boolean): Promise<Notification> {
  return prisma.notification.update({ where: { id }, data: { unread } })
}

// 모두 읽음 처리 — 갱신된 행 수를 반환한다.
export async function markAllRead(): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: { unread: true },
    data: { unread: false },
  })
  return result.count
}
