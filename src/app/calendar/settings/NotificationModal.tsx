'use client'

import { useState } from 'react'
import { Popup } from '../../components/Popup'
import './notificationModal.css'

interface Notification {
  id: string
  icon: string
  title: string
  description: string
  time: string
  read: boolean
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    icon: '🔴',
    title: '5월본 원천세 신고 4일 남았습니다',
    description: '6월 10일까지 5월본 원천세 신고 날짜입니다',
    time: '오늘 09:00',
    read: false,
  },
  {
    id: '2',
    icon: '🔔',
    title: '4대보험료 납부 안내',
    description: '5월본 4대보험료 납부 마감이 다가옵니다',
    time: '오늘 09:00',
    read: false,
  },
  {
    id: '3',
    icon: '🔴',
    title: '부가세 예정고지서가 발송되었습니다',
    description: '홈택스에서 1기 예정고지서 지종을 확인하세요',
    time: '어제 16:20',
    read: false,
  },
  {
    id: '4',
    icon: '🔵',
    title: '세무사 정기 상담 D-1',
    description: '내일 14:00 강남 세무실에 서무실 방문 예정',
    time: '어제 08:00',
    read: true,
  },
  {
    id: '5',
    icon: '🟠',
    title: '종합소득세 신고 한 안내',
    description: '성실신고확인제 신고기한은 6월 30일입니다',
    time: '6월 9일',
    read: true,
  },
  {
    id: '6',
    icon: '🔴',
    title: '일용근로 지급명세서 제출 안내',
    description: '5월본 지급명세서 정성 접수되었습니다',
    time: '6월 2일',
    read: true,
  },
]

export function NotificationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [tab, setTab] = useState<'all' | 'unread'>('all')
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  const unreadCount = notifications.filter((n) => !n.read).length
  const displayedNotifications =
    tab === 'unread' ? notifications.filter((n) => !n.read) : notifications

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <Popup isOpen={isOpen} onClose={onClose} title="알림">
      <div className="notification-tabs">
        <button
          className={`notification-tab ${tab === 'all' ? 'active' : ''}`}
          onClick={() => setTab('all')}
        >
          전체
        </button>
        <button
          className={`notification-tab ${tab === 'unread' ? 'active' : ''}`}
          onClick={() => setTab('unread')}
        >
          안 읽음 {unreadCount}
        </button>
        <button className="notification-mark-all" onClick={handleMarkAllAsRead}>
          모두 읽음
        </button>
      </div>

      <div className="notification-list">
        {displayedNotifications.length === 0 ? (
          <div className="notification-empty">알림이 없습니다</div>
        ) : (
          displayedNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => handleMarkAsRead(notification.id)}
            >
              <div className="notification-icon">{notification.icon}</div>
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-description">
                  {notification.description}
                </div>
                <div className="notification-time">{notification.time}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </Popup>
  )
}
