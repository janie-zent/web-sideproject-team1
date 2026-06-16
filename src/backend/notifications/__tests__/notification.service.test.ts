// notification.service 단위 테스트
// notification.repository를 mock하여 필터/읽음/모두읽음/id 접두어 변환을 검증한다.
import { describe, it, expect, beforeEach, vi } from 'vitest'

// repository 계층 전체를 mock으로 대체한다.
vi.mock('../repositories/notification.repository', () => ({
  findAll: vi.fn(),
  findUnread: vi.fn(),
  findById: vi.fn(),
  setUnread: vi.fn(),
  markAllRead: vi.fn(),
}))

import * as notificationRepository from '../repositories/notification.repository'
import * as notificationService from '../services/notification.service'
import type { Notification } from '../notification.types'

const mockedRepo = vi.mocked(notificationRepository)

// 테스트용 Notification 엔티티 팩토리
function buildNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 1,
    cat: 'with',
    title: '원천세 신고 알림',
    body: '본문',
    when: '오늘 09:00',
    unread: true,
    createdAt: new Date('2026-06-10T00:00:00.000Z'),
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('listNotifications (필터)', () => {
  it("filter='all'이면 findAll을 호출하고 id에 n 접두어를 붙인다", async () => {
    mockedRepo.findAll.mockResolvedValue([buildNotification({ id: 3 })])

    const list = await notificationService.listNotifications('all')

    expect(mockedRepo.findAll).toHaveBeenCalledTimes(1)
    expect(mockedRepo.findUnread).not.toHaveBeenCalled()
    expect(list[0].id).toBe('n3')
  })

  it("filter='unread'이면 findUnread만 호출한다", async () => {
    mockedRepo.findUnread.mockResolvedValue([buildNotification({ id: 4, unread: true })])

    const list = await notificationService.listNotifications('unread')

    expect(mockedRepo.findUnread).toHaveBeenCalledTimes(1)
    expect(mockedRepo.findAll).not.toHaveBeenCalled()
    expect(list[0].unread).toBe(true)
  })
})

describe('readNotification (단건 상태 변경)', () => {
  it('없는 id면 404 NOTIFICATION_NOT_FOUND (상태 변경 안 함)', async () => {
    mockedRepo.findById.mockResolvedValue(null)
    await expect(notificationService.readNotification(999)).rejects.toMatchObject({
      status: 404,
      code: 'NOTIFICATION_NOT_FOUND',
    })
    expect(mockedRepo.setUnread).not.toHaveBeenCalled()
  })

  it('존재하면 setUnread(id, false) 후 unread=false인 DTO를 반환한다', async () => {
    mockedRepo.findById.mockResolvedValue(buildNotification({ id: 5, unread: true }))
    mockedRepo.setUnread.mockResolvedValue(buildNotification({ id: 5, unread: false }))

    const dto = await notificationService.readNotification(5, false)

    expect(mockedRepo.setUnread).toHaveBeenCalledWith(5, false)
    expect(dto.id).toBe('n5')
    expect(dto.unread).toBe(false)
  })
})

describe('readAllNotifications (모두 읽음)', () => {
  it('repository.markAllRead의 갱신 수를 그대로 반환한다', async () => {
    mockedRepo.markAllRead.mockResolvedValue(3)
    const updated = await notificationService.readAllNotifications()
    expect(updated).toBe(3)
    expect(mockedRepo.markAllRead).toHaveBeenCalledTimes(1)
  })
})
