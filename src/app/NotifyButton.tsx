'use client'

import { useState } from 'react'
import styles from './page.module.css'

const TITLE = '세무일정관리'
const BODY = '🔔 OS 알림 테스트입니다. 정상 동작 중!'

export default function NotifyButton() {
  const [status, setStatus] = useState<string>('')
  const [needsPermission, setNeedsPermission] = useState(false)

  async function handleClick() {
    setNeedsPermission(false)

    // 1) Electron 환경: preload 가 노출한 IPC 로 메인의 네이티브 Notification 호출
    if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
      const res = await window.electronAPI.notify(TITLE, BODY)
      if (res.ok) {
        setStatus('✅ Electron 네이티브 알림을 보냈습니다.')
      } else if (res.reason === 'not-allowed') {
        setNeedsPermission(true)
        setStatus('⚠️ macOS가 이 앱의 알림을 막고 있습니다. 시스템 설정에서 허용해 주세요.')
      } else if (res.reason === 'unsupported') {
        setStatus('⚠️ 이 환경은 알림을 지원하지 않습니다.')
      } else {
        setStatus(`⚠️ 실패: ${res.reason ?? 'unknown'}`)
      }
      return
    }

    // 2) 일반 브라우저: 웹 Notification API 폴백 (권한 요청 필요)
    if (typeof Notification === 'undefined') {
      setStatus('⚠️ 이 환경은 알림을 지원하지 않습니다.')
      return
    }
    let permission = Notification.permission
    if (permission === 'default') permission = await Notification.requestPermission()
    if (permission === 'granted') {
      new Notification(TITLE, { body: BODY })
      setStatus('✅ 브라우저 웹 알림을 보냈습니다. (Electron이 아니라 웹 API 폴백)')
    } else {
      setStatus('⚠️ 알림 권한이 거부되었습니다. 브라우저/OS 설정에서 허용해 주세요.')
    }
  }

  return (
    <div>
      <button type="button" className={styles.button} onClick={handleClick}>
        OS 알림 테스트
      </button>
      {needsPermission && (
        <button
          type="button"
          className={styles.button}
          style={{ marginLeft: 8, background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)' }}
          onClick={() => window.electronAPI?.openNotificationSettings()}
        >
          알림 설정 열기
        </button>
      )}
      {status && <p className={styles.notifyStatus}>{status}</p>}
    </div>
  )
}
