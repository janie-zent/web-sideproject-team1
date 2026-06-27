'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Popup } from '../../components/Popup'
import { Toggle } from '../../components/Toggle'
import './settingsModal.css'

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
    <Popup isOpen={isOpen} onClose={onClose} title="세팅" position="right">
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
              <Toggle checked={settings.pushNotification} onChange={() => handleToggle('pushNotification')} />
            </div>

            <div className="settings-item">
              <label>이메일 알림</label>
              <Toggle checked={settings.emailNotification} onChange={() => handleToggle('emailNotification')} />
            </div>

            <div className="settings-item">
              <label>카카오 알림</label>
              <Toggle checked={settings.kakaoNotification} onChange={() => handleToggle('kakaoNotification')} />
            </div>

            <div className="settings-item">
              <label>SMS 알림</label>
              <Toggle checked={settings.smsNotification} onChange={() => handleToggle('smsNotification')} />
            </div>

            <div className="settings-item">
              <label>세무 일정 자동 알림</label>
              <Toggle checked={settings.autoNotification} onChange={() => handleToggle('autoNotification')} />
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
              <Toggle checked={settings.showTaxSchedule} onChange={() => handleToggle('showTaxSchedule')} />
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
    </Popup>
  )
}
