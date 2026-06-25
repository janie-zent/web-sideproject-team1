'use client'

/* 올챙이 — 월 그리드의 한 주(週). 셀 7개 위에 멀티데이 스팬 바를 그리드 오버레이로 얹는다.
   멀티데이 세그먼트를 겹치지 않게 레인(행)으로 그리디 배정한다.
   기본 행 높이(rowH)에 들어갈 만큼만 칩을 보여주고 넘치면 “+N 더보기”를 띄운다.
   넘치는 셀은 호버 시 흐름(in-flow)에서 높이가 늘어 전체를 펼친다(→ CalMonthCell). */
import {
  CELL_PAD_TOP,
  LANE_H,
  NUM_H,
  type Cell,
  type DayEvent,
  type Seg,
} from '../calendar-view'
import { type CalEvent, type ColorMode } from '../data'
import { CalMonthCell } from './CalMonthCell'
import { SpanBar } from './EventChip'

export function CalWeek({
  cells,
  singlesByDay,
  multis,
  colorMode,
  rowH,
  today,
  onEvent,
}: {
  cells: Cell[]
  singlesByDay: Record<number, DayEvent[]>
  multis: DayEvent[]
  colorMode: ColorMode
  rowH: number
  today: number | null
  onEvent?: (ev: CalEvent) => void
}) {
  // 이 주에 걸치는 멀티데이 세그먼트 계산
  const segs: Seg[] = []
  multis.forEach((ev) => {
    const matchCols: number[] = []
    cells.forEach((c, i) => {
      if (c.cur && ev.endDay != null && c.d >= ev.day && c.d <= ev.endDay) matchCols.push(i)
    })
    if (!matchCols.length) return
    const startCol = matchCols[0]
    const endCol = matchCols[matchCols.length - 1]
    segs.push({
      ev,
      startCol,
      span: endCol - startCol + 1,
      isStart: cells[startCol].d === ev.day,
      isEnd: cells[endCol].d === ev.endDay,
      lane: 0,
    })
  })
  // 레인 배정 (그리디)
  const laneEnds: number[] = []
  segs
    .sort((a, b) => a.startCol - b.startCol)
    .forEach((s) => {
      let lane = 0
      while (laneEnds[lane] !== undefined && laneEnds[lane] >= s.startCol) lane++
      s.lane = lane
      laneEnds[lane] = s.startCol + s.span - 1
    })
  const laneCount = laneEnds.length
  const laneAreaH = laneCount * LANE_H

  // 기획서 규칙 — 기본 행 높이에 보여줄 단일 칩 수(나머지는 “+N 더보기” → 호버 시 펼침).
  // 멀티데이 레인이 차지하는 만큼 한두 줄 줄인다. 호버 펼침은 셀 높이만 늘릴 뿐
  // 이 값에는 영향 주지 않아(rowH 고정) 같은 주의 다른 셀이 덩달아 펼쳐지지 않는다.
  const dense = rowH < 110
  const maxSingle = dense ? (laneCount >= 2 ? 1 : 2) : laneCount >= 1 ? 2 : 3

  return (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        minHeight: rowH,
      }}
    >
      {cells.map((cell, i) => (
        <CalMonthCell
          key={i}
          cell={cell}
          evs={cell.cur ? singlesByDay[cell.d] || [] : []}
          colorMode={colorMode}
          rowH={rowH}
          laneAreaH={laneAreaH}
          maxSingle={maxSingle}
          dense={dense}
          today={today}
          onEvent={onEvent}
        />
      ))}
      {laneCount > 0 && (
        <div
          style={{
            position: 'absolute',
            top: CELL_PAD_TOP + NUM_H,
            left: 0,
            right: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gridAutoRows: `${LANE_H}px`,
            pointerEvents: 'none',
          }}
        >
          {segs.map((s, i) => (
            <div
              key={i}
              style={{
                gridColumn: `${s.startCol + 1} / span ${s.span}`,
                gridRow: s.lane + 1,
                display: 'grid',
              }}
            >
              <SpanBar
                ev={s.ev}
                isStart={s.isStart}
                isEnd={s.isEnd}
                colorMode={colorMode}
                showLabel={s.isStart || s.startCol === 0}
                onEvent={onEvent}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
