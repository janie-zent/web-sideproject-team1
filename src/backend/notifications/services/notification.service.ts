// 알림 비즈니스 로직 계층 (service)
// repository + shared만 import 한다. prisma 직접 호출 금지.
import * as notificationRepository from '../repositories/notification.repository'
import { AppError } from '../../shared/errors'
import type {
  Notification,
  NotificationDto,
  NotificationFilter,
} from '../notification.types'
import type { CategoryKey } from '../../events/event.types'

// 내부 엔티티를 응답 DTO로 변환한다. id에 'n' 접두어를 붙인다. 단일 변환 지점.
function toDto(notification: Notification): NotificationDto {
  return {
    id: `n${notification.id}`,
    cat: notification.cat as CategoryKey,
    title: notification.title,
    body: notification.body,
    when: notification.when,
    unread: notification.unread,
  }
}

// 알림 목록 조회 (filter: all | unread)
export async function listNotifications(filter: NotificationFilter): Promise<NotificationDto[]> {
  const notifications =
    filter === 'unread'
      ? await notificationRepository.findUnread()
      : await notificationRepository.findAll()
  return notifications.map(toDto)
}

// 단건 상태 변경 — unread 값을 반영한다 (읽음=false). 기본값 false(읽음 처리).
export async function readNotification(id: number, unread = false): Promise<NotificationDto> {
  const existing = await notificationRepository.findById(id)
  if (!existing) {
    throw new AppError('NOTIFICATION_NOT_FOUND', 404, '알림을 찾을 수 없습니다')
  }
  const updated = await notificationRepository.setUnread(id, unread)
  return toDto(updated)
}

// 모두 읽음 처리 — 갱신된 알림 수를 반환한다.
export async function readAllNotifications(): Promise<number> {
  return notificationRepository.markAllRead()
}
