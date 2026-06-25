'use client'

/* 올챙이 — 한 달(月) 그리드. 셀을 만들어 주 단위로 잘라 CalWeek 에 넘긴다.
   세로 스크롤 목록의 한 칸이며 자연 높이(주 수 × ROW_H)로 렌더된다.
   상단의 '○년 ○월 + 요일' 헤더는 sticky 라, 해당 월을 스크롤하는 동안 위에 고정된다. */
import { useMemo } from 'react'
import { ROW_H, buildCells, type Cell, type DayEvent } from '../calendar-view'
import { WEEKDAYS, type CalEvent, type ColorMode } from '../data'
import { CalWeek } from './CalWeek'

export function CalendarGrid({
  year,
  month1,
  events,
  today,
  colorMode = 'category',
  rowH = ROW_H,
  onEvent,
}: {
  year: number
  month1: number
  events: DayEvent[]
  today: number | null
  colorMode?: ColorMode
  rowH?: number
  onEvent?: (ev: CalEvent) => void
}) {
  const cells = useMemo(() => buildCells(year, month1), [year, month1])
  const weeks: Cell[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  const { singlesByDay, multis } = useMemo(() => {
    const singles: Record<number, DayEvent[]> = {}
    const multi: DayEvent[] = []
    events.forEach((e) => {
      if (e.endDay) multi.push(e)
      else (singles[e.day] = singles[e.day] || []).push(e)
    })
    return { singlesByDay: singles, multis: multi }
  }, [events])

  return (
    <div style={{ borderLeft: '1px solid var(--border-2)' }}>
      {/* 월 라벨 + 요일 헤더 — 해당 월을 보는 동안 스크롤 상단에 고정 */}
      <div style={{ position: 'sticky', top: 0, zIndex: 3, background: 'var(--bg)' }}>
        <div
          style={{
            padding: '13px 12px 9px',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: 'var(--fg)',
            borderTop: '1px solid var(--border)',
          }}
        >
          {year}년 <span className="tnum">{month1}</span>월
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {WEEKDAYS.map((w, i) => (
            <div
              key={w}
              style={{
                padding: '8px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '.02em',
                color: i === 0 ? '#D98A7D' : i === 6 ? '#7FB0E0' : 'var(--fg-3)',
                borderRight: '1px solid var(--border-2)',
                borderBottom: '1px solid var(--border-2)',
                textAlign: 'left',
                background: 'var(--bg-sidebar)',
              }}
            >
              {w}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {weeks.map((wk, i) => (
          <CalWeek
            key={i}
            cells={wk}
            singlesByDay={singlesByDay}
            multis={multis}
            colorMode={colorMode}
            rowH={rowH}
            today={today}
            onEvent={onEvent}
          />
        ))}
      </div>
    </div>
  )
}
