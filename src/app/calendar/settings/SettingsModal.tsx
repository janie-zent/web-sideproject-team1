'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from './Modal'
import './modal.css'
import './settings.css'

interface SettingsState {
  pushNotification: boolean
  emailNotification: boolean
  kakaoNotification: boolean
  smsNotification: boolean
  autoNotification: boolean
  notificationTiming: 'day' | '1day' | '3day'
  showTaxSchedule: boolean
  weekStartDay: 'monday' | 'sunday'
}

export function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter()
  const [settings, setSettings] = useState<SettingsState>({
    pushNotification: true,
    emailNotification: true,
    kakaoNotification: true,
    smsNotification: false,
    autoNotification: true,
    notificationTiming: 'day',
    showTaxSchedule: true,
    weekStartDay: 'monday',
  })

  const handleToggle = (key: keyof SettingsState) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleNotificationTiming = (timing: 'day' | '1day' | '3day') => {
    setSettings((prev) => ({
      ...prev,
      notificationTiming: timing,
    }))
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    router.push('/login')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="세팅">
          {/* 프로필 섹션 */}
          <div className="settings-section">
            <div className="settings-section-title">계정</div>
            <div className="settings-profile">
              <div className="profile-avatar">김</div>
              <div className="profile-info">
                <div className="profile-name">김도윤</div>
                <div className="profile-role">도윤상사 · 프로 플랜</div>
              </div>
            </div>
          </div>

          {/* 알림 설정 섹션 */}
          <div className="settings-section">
            <h3 className="settings-section-title">알림 설정</h3>

            <div className="settings-item">
              <label>앱 푸시 알림</label>
              <div
                className={`toggle ${settings.pushNotification ? 'on' : 'off'}`}
                onClick={() => handleToggle('pushNotification')}
              >
                <div className="toggle-circle" />
              </div>
            </div>

            <div className="settings-item">
              <label>이메일 알림</label>
              <div
                className={`toggle ${settings.emailNotification ? 'on' : 'off'}`}
                onClick={() => handleToggle('emailNotification')}
              >
                <div className="toggle-circle" />
              </div>
            </div>

            <div className="settings-item">
              <label>카카오 알림</label>
              <div
                className={`toggle ${settings.kakaoNotification ? 'on' : 'off'}`}
                onClick={() => handleToggle('kakaoNotification')}
              >
                <div className="toggle-circle" />
              </div>
            </div>

            <div className="settings-item">
              <label>SMS 알림</label>
              <div
                className={`toggle ${settings.smsNotification ? 'on' : 'off'}`}
                onClick={() => handleToggle('smsNotification')}
              >
                <div className="toggle-circle" />
              </div>
            </div>

            <div className="settings-item">
              <label>세무 일정 자동 알림</label>
              <div
                className={`toggle ${settings.autoNotification ? 'on' : 'off'}`}
                onClick={() => handleToggle('autoNotification')}
              >
                <div className="toggle-circle" />
              </div>
            </div>

            <div className="settings-item">
              <label>기본 알림 시점</label>
              <div className="notification-timing">
                <button
                  className={`timing-btn ${settings.notificationTiming === 'day' ? 'active' : ''}`}
                  onClick={() => handleNotificationTiming('day')}
                >
                  당일
                </button>
                <button
                  className={`timing-btn ${settings.notificationTiming === '1day' ? 'active' : ''}`}
                  onClick={() => handleNotificationTiming('1day')}
                >
                  1일 전
                </button>
                <button
                  className={`timing-btn ${settings.notificationTiming === '3day' ? 'active' : ''}`}
                  onClick={() => handleNotificationTiming('3day')}
                >
                  3일 전
                </button>
              </div>
            </div>
          </div>

          {/* 캘린더 섹션 */}
          <div className="settings-section">
            <h3 className="settings-section-title">캘린더</h3>

            <div className="settings-item">
              <label>세무 일정 표시</label>
              <div
                className={`toggle ${settings.showTaxSchedule ? 'on' : 'off'}`}
                onClick={() => handleToggle('showTaxSchedule')}
              >
                <div className="toggle-circle" />
              </div>
            </div>

            <div className="settings-item">
              <label>주 시작 요일</label>
              <select className="settings-select" value={settings.weekStartDay}>
                <option value="monday">월요일</option>
                <option value="sunday">일요일</option>
              </select>
            </div>
          </div>

      {/* 로그아웃 */}
      <div className="settings-footer">
        <button className="logout-btn" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </Modal>
  )
}
