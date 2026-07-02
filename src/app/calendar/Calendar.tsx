'use client'

/* 올챙이 — 회원 캘린더 컨테이너 (월간 뷰, 세로 스크롤 월 이동)
   상태(삭제 · 선택 · 오늘 · 활성 월)와 레이아웃 조립만 담당한다.
   - 월 이동은 좌우 화살표가 아니라 본문 세로 스크롤로 한다. 여러 달을 위→아래로 쌓아
     하나의 스크롤 영역에 담고, 스크롤 위치로 헤더에 표시할 '활성 월'을 정한다.
   - 단일 일정 = 셀 안 칩, 멀티데이 일정 = 주를 가로지르는 스팬 바 → grid/CalendarGrid
   - 일정 클릭 → 우측 상세 패널(detail/EventDetail. 세무: 읽기 전용 / 개인: 삭제 가능)
   - 목업 데이터는 2026년 4~8월에 분포. */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  eventsForMonth,
  monthKey,
  monthRange,
  type DayEvent,
} from './calendar-view'
import { CalendarHeader, Legend } from './CalendarHeader'
import { DATA_MONTH, DATA_YEAR } from './data'
import { EventDetail } from './detail/EventDetail'
import { CalendarGrid } from './grid/CalendarGrid'
import { EVENTS } from './mock-events'

// 스크롤로 오갈 수 있는 월 범위 — 데이터(4~8월) 기준 앞뒤로 충분히 둔다.
const MONTHS_BEFORE = 6
const MONTHS_AFTER = 6

export default function Calendar() {
  const months = useMemo(
    () => monthRange(DATA_YEAR, DATA_MONTH, MONTHS_BEFORE, MONTHS_AFTER),
    [],
  )

  const [deleted, setDeleted] = useState<Set<string>>(() => new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // 헤더에 표시할 '활성 월' — 스크롤 위치에 따라 갱신된다. 초기값은 데이터 기준 월.
  const [activeKey, setActiveKey] = useState(() => monthKey(DATA_YEAR, DATA_MONTH))
  // 실제 '오늘' — SSR/정적 빌드 시점과 클라이언트 실행 시점의 날짜 차이로 인한
  // 하이드레이션 불일치를 피하려 마운트 후 클라이언트에서만 계산한다.
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => setNow(new Date()), [])

  const scrollRef = useRef<HTMLDivElement>(null)
  // 월별 섹션 DOM — 스크롤 위치 ↔ 월 매핑 및 특정 월로 스크롤할 때 쓴다.
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // 삭제분을 뺀 전체 일정을 월별 day/endDay 파생 형태로 미리 묶어 둔다.
  const eventsByMonth = useMemo(() => {
    const live = EVENTS.filter((e) => !deleted.has(e.id))
    const map = new Map<string, DayEvent[]>()
    months.forEach((m) =>
      map.set(monthKey(m.year, m.month1), eventsForMonth(live, m.year, m.month1)),
    )
    return map
  }, [deleted, months])

  // 선택된 일정은 모든 월에서 찾는다(현재 활성 월에 국한되지 않음).
  const selected = useMemo<DayEvent | null>(() => {
    if (!selectedId) return null
    const e = EVENTS.find((ev) => ev.id === selectedId)
    if (!e) return null
    return {
      ...e,
      day: Number(e.date.split('-')[2]),
      endDay: e.endDate ? Number(e.endDate.split('-')[2]) : undefined,
    }
  }, [selectedId])

  // 해당 월이 실제 현재 달과 같을 때만 그 날짜를 '오늘'로 강조한다.
  const todayFor = (year: number, month1: number) =>
    now && year === now.getFullYear() && month1 === now.getMonth() + 1
      ? now.getDate()
      : null

  // 스크롤 위치로 활성 월 결정 — 뷰포트 상단을 차지한(시작점이 상단 위인) 마지막 월.
  const ticking = useRef(false)
  const syncActive = useCallback(() => {
    const sc = scrollRef.current
    if (!sc) return
    const line = sc.scrollTop + 2
    let active = months[0]
    for (const m of months) {
      const el = sectionRefs.current.get(monthKey(m.year, m.month1))
      if (el && el.offsetTop <= line) active = m
      else break
    }
    const k = monthKey(active.year, active.month1)
    setActiveKey((prev) => (prev === k ? prev : k))
  }, [months])

  const onScroll = () => {
    if (ticking.current) return
    ticking.current = true
    requestAnimationFrame(() => {
      ticking.current = false
      syncActive()
    })
  }

  const scrollToMonth = (year: number, month1: number, smooth = true) => {
    const sc = scrollRef.current
    const el = sectionRefs.current.get(monthKey(year, month1))
    if (sc && el) sc.scrollTo({ top: el.offsetTop, behavior: smooth ? 'smooth' : 'auto' })
  }

  // 첫 렌더 후 데이터 기준 월로 즉시 스크롤(점프 없이).
  useLayoutEffect(() => {
    scrollToMonth(DATA_YEAR, DATA_MONTH, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goToday = () => {
    setSelectedId(null)
    const d = now ?? new Date()
    const ty = d.getFullYear()
    const tm = d.getMonth() + 1
    if (sectionRefs.current.has(monthKey(ty, tm))) scrollToMonth(ty, tm)
    else scrollToMonth(DATA_YEAR, DATA_MONTH)
  }

  const handleDelete = (id: string) => {
    setDeleted((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
    setSelectedId(null)
  }

  const [activeYear, activeMonth1] = activeKey.split('-').map(Number)

  return (
    <div className="win">
      <CalendarHeader year={activeYear} month1={activeMonth1} onToday={goToday} />

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
          {/* 세로 스크롤 영역 — 여러 달을 쌓아 스크롤로 월을 이동한다 */}
          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="cal-scroll"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              position: 'relative',
            }}
          >
            {months.map((m) => {
              const k = monthKey(m.year, m.month1)
              return (
                <div
                  key={k}
                  ref={(el) => {
                    if (el) sectionRefs.current.set(k, el)
                    else sectionRefs.current.delete(k)
                  }}
                >
                  <CalendarGrid
                    year={m.year}
                    month1={m.month1}
                    events={eventsByMonth.get(k) ?? []}
                    today={todayFor(m.year, m.month1)}
                    onEvent={(ev) => setSelectedId(ev.id)}
                  />
                </div>
              )
            })}
          </div>
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
