'use client'

/* 올챙이 — 월 그리드의 한 날짜 셀. 단일 일정 칩을 쌓고, 넘치면 “+N 더보기”로 양보한다.
   넘치는 셀에 호버하면 흐름(in-flow)에서 셀 높이가 일정 개수만큼 늘어 전체를 펼친다.
   같은 주의 셀들은 그리드 행을 공유하므로 함께 키가 맞춰지며, 아래 달은 자연스레 밀려난다. */
import { useState } from 'react'
import { CELL_PAD_TOP, NUM_H, type Cell } from '../calendar-view'
import { type CalEvent, type ColorMode } from '../data'
import { Chip } from './EventChip'

export function CalMonthCell({
  cell,
  evs,
  colorMode,
  rowH,
  laneAreaH,
  maxSingle,
  dense,
  today,
  onEvent,
}: {
  cell: Cell
  evs: CalEvent[]
  colorMode: ColorMode
  rowH: number
  laneAreaH: number
  maxSingle: number
  dense: boolean
  today: number | null
  onEvent?: (ev: CalEvent) => void
}) {
  const [hover, setHover] = useState(false)
  const isToday = cell.cur && cell.d === today
  // 기획서 규칙 — maxSingle 개까지 보여주고, 넘치면 “+N 더보기”로 양보한다.
  const shown = evs.slice(0, maxSingle)
  const more = evs.length - shown.length
  const expandable = more > 0
  // 넘치는 셀에 호버하면 전체를 펼친다 → 셀(행)이 흐름에서 높아진다.
  const expanded = hover && expandable
  const list = expanded ? evs : shown
  const dow = cell._dow
  const dayColor = !cell.cur
    ? 'var(--fg-5)'
    : dow === 0
      ? '#D98A7D'
      : dow === 6
        ? '#7FB0E0'
        : 'var(--fg-2)'

  const dayNum = (
    <div style={{ height: NUM_H, display: 'flex', alignItems: 'flex-start' }}>
      <span
        className="tnum"
        style={{
          fontSize: 12,
          fontWeight: isToday ? 700 : 500,
          color: isToday ? '#fff' : dayColor,
          width: 22,
          height: 22,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          background: isToday ? 'var(--book-cloth)' : 'transparent',
        }}
      >
        {cell.d}
      </span>
    </div>
  )

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        minWidth: 0,
        borderRight: '1px solid var(--border-2)',
        borderBottom: '1px solid var(--border-2)',
        background: expanded
          ? 'var(--bg-hover)'
          : cell.cur
            ? 'transparent'
            : 'rgba(0,0,0,0.12)',
      }}
    >
      <div
        style={{
          minHeight: rowH,
          padding: `${CELL_PAD_TOP}px 6px 8px`,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {dayNum}
        {laneAreaH > 0 && <div style={{ height: laneAreaH, flexShrink: 0 }} />}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            minWidth: 0,
            marginTop: 2,
          }}
        >
          {list.map((ev) => (
            <Chip key={ev.id} ev={ev} colorMode={colorMode} dense={dense} onEvent={onEvent} />
          ))}
          {!expanded && more > 0 && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--fg-3)',
                padding: '1px 6px',
                cursor: 'pointer',
              }}
            >
              +{more}건 더보기
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
