'use client'

/* 올챙이 — 회원 캘린더 메인 (월간 뷰)
   기획 디자인 문서의 CalendarGrid / MemberMain / EventDetail 을 이식.
   - 단일 일정 = 셀 안 칩, 멀티데이 일정 = 주를 가로지르는 스팬 바
   - 일정 클릭 → 우측 상세 패널 (세무: 읽기 전용 / 개인: 삭제 가능)
   - 월 이동(이전/다음/오늘) 지원. 목업 데이터는 2026년 4~8월에 분포. */

import { useEffect, useMemo, useState } from 'react'
import {
  CATS,
  DATA_MONTH,
  DATA_YEAR,
  WEEKDAYS,
  type CalEvent,
  type CatKey,
  type ColorMode,
} from './data'
import { EVENTS } from './mock-events'
import {
  IcBell,
  IcCalPlus,
  IcCheck,
  IcChevL,
  IcChevR,
  IcClock,
  IcClose,
  IcEdit,
  IcGear,
  IcLock,
  IcMemo,
  IcPin,
  IcTag,
  IcTrash,
  LogoTadpole,
} from './icons'

const NUM_H = 24 // 날짜 숫자 줄 높이
const LANE_H = 20 // 멀티데이 바 한 레인 높이
const CELL_PAD_TOP = 6
const ROW_H = 118

interface Cell {
  d: number
  cur: boolean
  _dow: number
}

/** 화면 렌더용 — ISO 날짜에서 표시 중인 달의 day/endDay 를 파생해 붙인 이벤트 */
type DayEvent = CalEvent & { day: number; endDay?: number }

// 연·월(1~12)로 월 그리드 셀 계산. 일요일 시작, 마지막 주까지 채움.
function buildCells(year: number, month1: number): Cell[] {
  const firstDow = new Date(year, month1 - 1, 1).getDay() // 0=일 ~ 6=토
  const daysInMonth = new Date(year, month1, 0).getDate()
  const prevDays = new Date(year, month1 - 1, 0).getDate()
  const cells: Omit<Cell, '_dow'>[] = []
  for (let i = firstDow; i > 0; i--) cells.push({ d: prevDays - i + 1, cur: false })
  for (let d = 1; d <= daysInMonth; d++) cells.push({ d, cur: true })
  let nd = 1
  while (cells.length % 7 !== 0) cells.push({ d: nd++, cur: false })
  return cells.map((c, i) => ({ ...c, _dow: i % 7 }))
}

function calColor(cat: CatKey, colorMode: ColorMode): string {
  const meta = CATS[cat]
  if (colorMode === 'binary') return meta.type === 'tax' ? 'var(--book-cloth)' : 'var(--cat-personal)'
  if (colorMode === 'mono') return meta.type === 'tax' ? 'var(--cloud-medium)' : 'var(--ui-blue-soft)'
  return meta.color
}

// ── 단일 일정 칩 ──────────────────────────────────────────
function Chip({
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
      {done && <IcCheck size={11} color={color} />}
      {text}
    </div>
  )
}

// ── 멀티데이 스팬 바 ─────────────────────────────────────
function SpanBar({
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

// ── 한 셀 (날짜 + 단일 칩) — 호버 시 펼쳐서 전체 일정 표시 ──
function CalMonthCell({
  cell,
  evs,
  colorMode,
  rowH,
  laneAreaH,
  maxSingle,
  today,
  onEvent,
}: {
  cell: Cell
  evs: CalEvent[]
  colorMode: ColorMode
  rowH: number
  laneAreaH: number
  maxSingle: number
  today: number | null
  onEvent?: (ev: CalEvent) => void
}) {
  const [hover, setHover] = useState(false)
  const isToday = cell.cur && cell.d === today
  const shown = evs.slice(0, maxSingle)
  const more = evs.length - shown.length
  const expandable = more > 0
  const expanded = hover && expandable
  const dow = cell._dow
  const dayColor = !cell.cur
    ? 'var(--fg-5)'
    : dow === 0
      ? '#D98A7D'
      : dow === 6
        ? '#7FB0E0'
        : 'var(--fg-2)'
  const dense = rowH < 110

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

  const chipList = (list: CalEvent[]) =>
    list.map((ev) => (
      <Chip
        key={ev.id}
        ev={ev}
        colorMode={colorMode}
        dense={dense}
        onEvent={onEvent}
      />
    ))

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        minWidth: 0,
        borderRight: '1px solid var(--border-2)',
        borderBottom: '1px solid var(--border-2)',
        background: cell.cur ? 'transparent' : 'rgba(0,0,0,0.12)',
      }}
    >
      {/* 기본(접힌) 뷰 — 항상 흐름상 자리를 차지해 레이아웃이 흔들리지 않는다 */}
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
          {chipList(shown)}
          {more > 0 && (
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

      {/* 호버 시 펼침 — 아래 행 위로 떠서 불투명 카드로 덮는다(레이아웃 침범 방지) */}
      {expanded && (
        <div
          style={{
            position: 'absolute',
            top: -1,
            left: -1,
            right: -1,
            zIndex: 20,
            minHeight: rowH,
            padding: `${CELL_PAD_TOP}px 6px 8px`,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-strong)',
            borderRadius: 8,
            boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
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
            {chipList(evs)}
          </div>
        </div>
      )}
    </div>
  )
}

interface Seg {
  ev: DayEvent
  startCol: number
  span: number
  isStart: boolean
  isEnd: boolean
  lane: number
}

// ── 한 주 — 셀 7개 + 멀티데이 오버레이 ───────────────────
function CalWeek({
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
  const maxSingle = rowH < 110 ? (laneCount >= 2 ? 1 : 2) : laneCount >= 1 ? 2 : 3

  return (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        flex: 1,
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

// ── 요일 헤더 + 월 그리드 ────────────────────────────────
function CalendarGrid({
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        borderTop: '1px solid var(--border-2)',
        borderLeft: '1px solid var(--border-2)',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', flexShrink: 0 }}>
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
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
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

// ── 범례 ─────────────────────────────────────────────────
function Legend({ compact }: { compact?: boolean }) {
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

// ── 헤더 조각 ────────────────────────────────────────────
function Traffic() {
  return (
    <div className="traffic">
      <i className="r" />
      <i className="y" />
      <i className="g" />
    </div>
  )
}

function MonthNav({
  year,
  month1,
  onPrev,
  onNext,
  onToday,
}: {
  year: number
  month1: number
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
      <button className="iconbtn" style={{ width: 30, height: 30 }} title="이전 달" onClick={onPrev}>
        <IcChevL size={18} />
      </button>
      <button className="iconbtn" style={{ width: 30, height: 30 }} title="다음 달" onClick={onNext}>
        <IcChevR size={18} />
      </button>
      <button className="btn btn-sm" style={{ marginLeft: 2 }} onClick={onToday}>
        오늘
      </button>
    </div>
  )
}

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

// ── 카테고리 배지 ────────────────────────────────────────
function CatBadge({ cat }: { cat: CatKey }) {
  const meta = CATS[cat]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 11px',
        borderRadius: 'var(--radius-pill)',
        fontSize: 12,
        fontWeight: 600,
        background: `color-mix(in srgb, ${meta.color} 18%, transparent)`,
        color: meta.color,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color }} />
      {meta.label}
    </span>
  )
}

function DetailRow({
  icon,
  label,
  value,
  multiline,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  multiline?: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: 11, alignItems: multiline ? 'flex-start' : 'center' }}>
      <div style={{ width: 20, flexShrink: 0, marginTop: multiline ? 1 : 0 }}>{icon}</div>
      <div
        style={{
          width: 52,
          flexShrink: 0,
          fontSize: 12.5,
          color: 'var(--fg-4)',
          fontWeight: 500,
          marginTop: multiline ? 1 : 0,
        }}
      >
        {label}
      </div>
      <div
        style={{
          flex: 1,
          fontSize: 13.5,
          color: 'var(--fg-2)',
          lineHeight: multiline ? 1.55 : 1.2,
        }}
      >
        {value}
      </div>
    </div>
  )
}

// ── 일정 상세 패널 ───────────────────────────────────────
function EventDetail({
  ev,
  onClose,
  onDelete,
}: {
  ev: CalEvent
  onClose: () => void
  onDelete: (id: string) => void
}) {
  const meta = CATS[ev.cat]
  const kind = meta.type
  // '2026-06-19' → '2026. 06. 19', endDate 는 'MM. DD' 로 (… ~ 06. 23)
  const dateStr =
    ev.date.replace(/-/g, '. ') +
    (ev.endDate ? ` ~ ${ev.endDate.slice(5).replace('-', '. ')}` : '') +
    (ev.time ? `  ${ev.time}` : '')

  const footer =
    kind === 'tax' ? (
      <button
        className="btn btn-primary"
        onClick={() => window.open('https://www.hometax.go.kr', '_blank', 'noopener')}
      >
        홈택스 바로가기
      </button>
    ) : (
      <>
        <button
          className="btn"
          style={{ color: 'var(--state-error)' }}
          onClick={() => onDelete(ev.id)}
        >
          <IcTrash size={15} color="var(--state-error)" /> 삭제
        </button>
        <div style={{ flex: 1 }} />
        <button className="btn">
          <IcEdit size={15} /> 수정
        </button>
        <button className="btn btn-primary" onClick={onClose}>
          확인
        </button>
      </>
    )

  return (
    <div className="card" style={{ width: '100%', height: '100%', background: 'var(--bg-surface-1)', border: 'none', borderRadius: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          padding: '16px 18px 14px',
          borderBottom: '1px solid var(--border-2)',
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1, fontSize: 16, fontWeight: 700, color: 'var(--fg)' }}>일정 상세</div>
        <button className="iconbtn" style={{ width: 30, height: 30 }} onClick={onClose} title="닫기">
          <IcClose size={18} />
        </button>
      </div>

      <div className="scroll" style={{ padding: '16px 18px', overflowY: 'auto', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 13 }}>
          <CatBadge cat={ev.cat} />
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: 'var(--radius-pill)',
              fontSize: 11,
              fontWeight: 600,
              background: 'var(--bg-input)',
              color: 'var(--fg-3)',
            }}
          >
            {kind === 'tax' ? (
              <>
                <IcLock size={12} /> 읽기 전용 · 세무 일정
              </>
            ) : (
              <>
                <IcPin size={12} /> 내 일정
              </>
            )}
          </span>
        </div>

        <div
          style={{
            fontSize: 21,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
            marginBottom: 14,
            color: 'var(--fg)',
          }}
        >
          {ev.title}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, paddingBottom: 4 }}>
          <DetailRow icon={<IcClock size={16} color="var(--fg-3)" />} label="일시" value={dateStr} />
          {kind === 'tax' ? (
            <>
              <DetailRow
                icon={<IcTag size={16} color="var(--fg-3)" />}
                label="신고 주기"
                value={ev.cycle ?? meta.label}
              />
              <DetailRow
                icon={<IcMemo size={16} color="var(--fg-3)" />}
                label="안내"
                value={ev.desc}
                multiline
              />
              <div
                style={{
                  marginTop: 4,
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'var(--bg-input)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <IcBell size={17} color="var(--book-cloth)" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>이 일정 알림</div>
                    <div style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>1일 전 · 당일 오전 9시</div>
                  </div>
                </div>
                <div className="toggle on">
                  <i />
                </div>
              </div>
            </>
          ) : (
            <>
              <DetailRow icon={<IcBell size={16} color="var(--fg-3)" />} label="알림" value="1일 전" />
              <DetailRow
                icon={<IcMemo size={16} color="var(--fg-3)" />}
                label="메모"
                value={ev.desc}
                multiline
              />
            </>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '13px 18px',
          borderTop: '1px solid var(--border-2)',
          flexShrink: 0,
        }}
      >
        {footer}
      </div>
    </div>
  )
}

// ── 캘린더 메인 (상태 관리) ──────────────────────────────
export default function Calendar() {
  const [year, setYear] = useState(DATA_YEAR)
  const [month1, setMonth1] = useState(DATA_MONTH)
  const [deleted, setDeleted] = useState<Set<string>>(() => new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // 실제 '오늘' — SSR/정적 빌드 시점과 클라이언트 실행 시점의 날짜 차이로 인한
  // 하이드레이션 불일치를 피하려 마운트 후 클라이언트에서만 계산한다.
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => setNow(new Date()), [])

  // 표시 중인 (연, 월) 의 이벤트만 추려 ISO 날짜에서 day/endDay 를 파생한다.
  const events = useMemo<DayEvent[]>(
    () =>
      EVENTS.filter((e) => {
        if (deleted.has(e.id)) return false
        const [ey, em] = e.date.split('-').map(Number)
        return ey === year && em === month1
      }).map((e) => ({
        ...e,
        day: Number(e.date.split('-')[2]),
        endDay: e.endDate ? Number(e.endDate.split('-')[2]) : undefined,
      })),
    [year, month1, deleted],
  )
  const selected = selectedId ? events.find((e) => e.id === selectedId) ?? null : null
  // 표시 중인 달이 실제 현재 달과 같을 때만 그 날짜를 '오늘'로 강조한다.
  const today =
    now && year === now.getFullYear() && month1 === now.getMonth() + 1
      ? now.getDate()
      : null

  const goPrev = () => {
    setSelectedId(null)
    if (month1 === 1) {
      setYear((y) => y - 1)
      setMonth1(12)
    } else setMonth1((m) => m - 1)
  }
  const goNext = () => {
    setSelectedId(null)
    if (month1 === 12) {
      setYear((y) => y + 1)
      setMonth1(1)
    } else setMonth1((m) => m + 1)
  }
  const goToday = () => {
    setSelectedId(null)
    setYear(DATA_YEAR)
    setMonth1(DATA_MONTH)
  }
  const handleDelete = (id: string) => {
    setDeleted((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
    setSelectedId(null)
  }

  return (
    <div className="win">
      {/* 헤더 */}
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
          <MonthNav year={year} month1={month1} onPrev={goPrev} onNext={goNext} onToday={goToday} />
          <div style={{ flex: 1 }} />
          <Actions />
        </div>
      </div>

      {/* 본문 */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>
        {/* 캘린더 (좌측) */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            minWidth: 0,
          }}
        >
          <CalendarGrid
            year={year}
            month1={month1}
            events={events}
            today={today}
            onEvent={(ev) => setSelectedId(ev.id)}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '11px 18px',
              gap: 16,
              borderTop: '1px solid var(--border-2)',
              background: 'var(--bg-sidebar)',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-4)' }}>분류</span>
            <Legend compact />
          </div>
        </div>

        {/* 상세 패널 (우측, 하프) */}
        {selected && (
          <div
            style={{
              width: 430,
              flexShrink: 0,
              borderLeft: '1px solid var(--border)',
              display: 'flex',
            }}
          >
            <EventDetail ev={selected} onClose={() => setSelectedId(null)} onDelete={handleDelete} />
          </div>
        )}
      </div>
    </div>
  )
}
