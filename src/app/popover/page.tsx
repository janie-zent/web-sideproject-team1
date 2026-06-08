'use client'

import { useEffect, useState } from 'react'
import styles from './popover.module.css'

// 트레이 팝오버에 표시되는 "알림 센터" 패널.
// 현재 DB 스키마가 비어 있어(껍데기) 샘플 항목을 보여준다.
// 도메인 모델이 확정되면 Dexie 에서 다가오는 일정으로 교체하면 된다.
const SAMPLE = [
  { tag: '부가세', text: '1기 확정신고', due: 'D-12' },
  { tag: '원천세', text: '6월분 납부', due: 'D-3' },
  { tag: '법인세', text: '중간예납 안내', due: 'D-30' },
]

export default function PopoverPanel() {
  const [now, setNow] = useState('')

  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleString('ko-KR', { dateStyle: 'long', timeStyle: 'short' })
    setNow(fmt())
    const id = setInterval(() => setNow(fmt()), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={styles.panel}>
      <header className={styles.header}>
        <span className={styles.bell} aria-hidden>🔔</span>
        <div>
          <h1 className={styles.title}>알림 센터</h1>
          <p className={styles.now}>{now}</p>
        </div>
      </header>

      <ul className={styles.list}>
        {SAMPLE.map((it) => (
          <li key={it.tag} className={styles.item}>
            <span className={styles.tag}>{it.tag}</span>
            <span className={styles.text}>{it.text}</span>
            <span className={styles.due}>{it.due}</span>
          </li>
        ))}
      </ul>

      <footer className={styles.footer}>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => window.electronAPI?.openMainWindow()}
        >
          전체 보기
        </button>
        <button
          type="button"
          className={styles.quit}
          onClick={() => window.electronAPI?.quitApp()}
        >
          종료
        </button>
      </footer>
    </div>
  )
}
