'use client'

/* 올챙이 — 캘린더 상단 헤더 바(트래픽 라이트 · 로고 · 월 네비 · 액션)와 하단 범례.
   Traffic / MonthNav / Actions 는 헤더 바 전용 조각이라 내부에 두고, 조립된 CalendarHeader 와 Legend 만 노출한다.
   일렉트론에선 헤더를 창 드래그 영역으로 쓰고 실제 macOS 신호등을 헤더 위에 얹는다(가짜 점 대신 자리만 비운다).
   브라우저 미리보기에선 신호등이 없으므로 디자인용 가짜 점을 그린다. */
import { useEffect, useState, type CSSProperties } from 'react'
import { CATS } from './data'
import { IcBell, IcCalPlus, IcGear, LogoTadpole } from './icons'

// 일렉트론 창 드래그 영역 지정(-webkit-app-region). 브라우저에선 무시된다.
const DRAG = { WebkitAppRegion: 'drag' } as CSSProperties
const NO_DRAG = { WebkitAppRegion: 'no-drag' } as CSSProperties
// 헤더 위에 얹히는 실제 신호등이 차지할 좌측 폭(대략 3개 버튼 + 여백).
const TRAFFIC_SLOT = 56

// ── macOS 트래픽 라이트 ──────────────────────────────────
function Traffic() {
  return (
    <div className="traffic">
      <i className="r" />
      <i className="y" />
      <i className="g" />
    </div>
  )
}

// ── 월 표시 + 오늘 (월 이동은 본문 세로 스크롤로 한다) ────
function MonthNav({
  year,
  month1,
  onToday,
}: {
  year: number
  month1: number
  onToday: () => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--fg)',
          whiteSpace: 'nowrap',
        }}
      >
        {year}년 <span className="tnum">{month1}</span>월
      </div>
      <button className="btn btn-sm" style={NO_DRAG} onClick={onToday}>
        오늘
      </button>
    </div>
  )
}

// ── 우측 액션 (일정 등록/알림/세팅/로그아웃) ──────────────
function Actions({
  onSettingsClick,
  onNotificationClick,
  onAddEventClick,
}: {
  onSettingsClick: () => void
  onNotificationClick: () => void
  onAddEventClick: () => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button className="iconbtn" title="일정 등록" onClick={onAddEventClick}>
        <IcCalPlus size={20} />
      </button>
      <button className="iconbtn" title="알림" onClick={onNotificationClick}>
        <IcBell size={20} />
        <span className="dot-badge" />
      </button>
      <button className="iconbtn" title="세팅" onClick={onSettingsClick}>
        <IcGear size={20} />
      </button>
    </div>
  )
}

// ── 상단 헤더 바 (조립) ──────────────────────────────────
export function CalendarHeader({
  year,
  month1,
  onToday,
  onSettingsClick,
  onNotificationClick,
  onAddEventClick,
}: {
  year: number
  month1: number
  onToday: () => void
  onSettingsClick: () => void
  onNotificationClick: () => void
  onAddEventClick: () => void
}) {
  // 일렉트론 여부는 preload 가 노출한 window.electronAPI.isElectron 로 판별.
  // 하이드레이션 불일치를 피해 마운트 후 클라이언트에서만 계산한다.
  const [isElectron, setIsElectron] = useState(false)
  useEffect(() => {
    setIsElectron(
      !!(window as unknown as { electronAPI?: { isElectron?: boolean } }).electronAPI?.isElectron,
    )
  }, [])

  return (
    <div style={{ flexShrink: 0 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '0 16px',
          height: 58,
          borderBottom: '1px solid var(--border-2)',
          ...DRAG,
        }}
      >
        {isElectron ? (
          <div style={{ width: TRAFFIC_SLOT, flexShrink: 0 }} />
        ) : (
          <Traffic />
        )}
        <LogoTadpole size={21} />
        <div style={{ width: 1, height: 22, background: 'var(--border)' }} />
        <MonthNav year={year} month1={month1} onToday={onToday} />
        <div style={{ flex: 1 }} />
        <Actions onSettingsClick={onSettingsClick} onNotificationClick={onNotificationClick} onAddEventClick={onAddEventClick} />
      </div>
    </div>
  )
}

// ── 범례 (하단) ──────────────────────────────────────────
export function Legend({ compact }: { compact?: boolean }) {
  const items = Object.values(CATS).map((v) => ({ color: v.color, label: v.label }))
  return (
    <div style={{ display: 'flex', gap: compact ? 12 : 18, flexWrap: 'wrap', alignItems: 'center' }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span
            style={{ width: 9, height: 9, borderRadius: '50%', background: it.color, flexShrink: 0 }}
          />
          <span style={{ fontSize: 12, color: 'var(--fg-3)', fontWeight: 500 }}>{it.label}</span>
        </div>
      ))}
    </div>
  )
}
