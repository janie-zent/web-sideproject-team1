'use client'

/* 올챙이 — 캘린더 상단 헤더 바(트래픽 라이트 · 로고 · 월 네비 · 액션)와 하단 범례.
   Traffic / MonthNav / Actions 는 헤더 바 전용 조각이라 내부에 두고, 조립된 CalendarHeader 와 Legend 만 노출한다. */
import { CATS } from './data'
import { IcBell, IcCalPlus, IcGear, LogoTadpole } from './icons'

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
      <button className="btn btn-sm" onClick={onToday}>
        오늘
      </button>
    </div>
  )
}

// ── 우측 액션 (일정 등록/알림/세팅) ──────────────────────
function Actions() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button className="iconbtn" title="일정 등록">
        <IcCalPlus size={20} />
      </button>
      <button className="iconbtn" title="알림">
        <IcBell size={20} />
        <span className="dot-badge" />
      </button>
      <button className="iconbtn" title="세팅">
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
}: {
  year: number
  month1: number
  onToday: () => void
}) {
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
        }}
      >
        <Traffic />
        <LogoTadpole size={21} />
        <div style={{ width: 1, height: 22, background: 'var(--border)' }} />
        <MonthNav year={year} month1={month1} onToday={onToday} />
        <div style={{ flex: 1 }} />
        <Actions />
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
