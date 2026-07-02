'use client'

/* 올챙이 — 캘린더 셀 안의 일정 표현.
   Chip = 단일 일정(셀 안 칩) · SpanBar = 멀티데이(주를 가로지르는 스팬 바). */
import { calColor } from '../calendar-view'
import { type CalEvent, type ColorMode } from '../data'
import { IcCheck } from '../icons'

// ── 단일 일정 칩 ──────────────────────────────────────────
export function Chip({
  ev,
  colorMode,
  dense,
  onEvent,
}: {
  ev: CalEvent
  colorMode: ColorMode
  dense: boolean
  onEvent?: (ev: CalEvent) => void
}) {
  const color = calColor(ev.cat, colorMode)
  const label = (ev.time ? ev.time + ' ' : '') + ev.title
  const done = ev.done
  const text = (
    <span
      style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textDecoration: done ? 'line-through' : 'none',
        opacity: done ? 0.55 : 1,
      }}
    >
      {label}
    </span>
  )
  const base = {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: dense ? 11 : 12,
    lineHeight: 1.25,
    fontWeight: 500,
    padding: dense ? '2px 6px' : '3px 7px',
    borderRadius: 5,
    cursor: 'pointer',
    minWidth: 0,
  } as const
  const click = onEvent ? () => onEvent(ev) : undefined

  return (
    <div
      onClick={click}
      style={{
        ...base,
        position: 'relative',
        paddingLeft: dense ? 9 : 10,
        background: `color-mix(in srgb, ${color} 16%, transparent)`,
        color: 'var(--fg)',
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: 2,
          bottom: 2,
          width: 3,
          borderRadius: 3,
          background: color,
        }}
      />
      {/* 완료 표시 — 카테고리색 체크 아이콘. viewBox 보존으로 정상 스케일·중앙 정렬. */}
      {done && <IcCheck size={14} color={color} />}
      {text}
    </div>
  )
}

// ── 멀티데이 스팬 바 ─────────────────────────────────────
export function SpanBar({
  ev,
  isStart,
  isEnd,
  colorMode,
  showLabel,
  onEvent,
}: {
  ev: CalEvent
  isStart: boolean
  isEnd: boolean
  colorMode: ColorMode
  showLabel: boolean
  onEvent?: (ev: CalEvent) => void
}) {
  const color = calColor(ev.cat, colorMode)
  return (
    <div
      onClick={onEvent ? () => onEvent(ev) : undefined}
      style={{
        height: 17,
        alignSelf: 'center',
        pointerEvents: 'auto',
        cursor: 'pointer',
        marginLeft: isStart ? 4 : 0,
        marginRight: isEnd ? 4 : 0,
        background: color,
        color: '#fff',
        borderTopLeftRadius: isStart ? 5 : 0,
        borderBottomLeftRadius: isStart ? 5 : 0,
        borderTopRightRadius: isEnd ? 5 : 0,
        borderBottomRightRadius: isEnd ? 5 : 0,
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '0 8px',
        fontSize: 11,
        fontWeight: 600,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      {!isStart && <span style={{ opacity: 0.85, marginLeft: -2 }}>◀</span>}
      {showLabel && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</span>}
    </div>
  )
}
