/* 올챙이 — 캘린더 뷰 로직: 레이아웃 상수 · 그리드 타입 · 순수 헬퍼.
   JSX 가 없는 순수 모듈이라 그리드 컴포넌트들이 공유하고 단위 테스트하기 쉽다. */
import { CATS, type CalEvent, type CatKey, type ColorMode } from './data'

// ── 레이아웃 상수 ────────────────────────────────────────
export const NUM_H = 24 // 날짜 숫자 줄 높이
export const LANE_H = 20 // 멀티데이 바 한 레인 높이
export const CELL_PAD_TOP = 6
export const ROW_H = 122 // 날짜 셀(한 주 행)의 기본 높이 — 기획서 기준

// ── 그리드 타입 ──────────────────────────────────────────
export interface Cell {
  d: number
  cur: boolean
  _dow: number
}

/** 화면 렌더용 — ISO 날짜에서 표시 중인 달의 day/endDay 를 파생해 붙인 이벤트 */
export type DayEvent = CalEvent & { day: number; endDay?: number }

export interface Seg {
  ev: DayEvent
  startCol: number
  span: number
  isStart: boolean
  isEnd: boolean
  lane: number
}

// ── 순수 헬퍼 ────────────────────────────────────────────
// 연·월(1~12)로 월 그리드 셀 계산. 일요일 시작, 마지막 주까지 채움.
export function buildCells(year: number, month1: number): Cell[] {
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

// ── 월 스크롤 헬퍼 ───────────────────────────────────────
export interface YearMonth {
  year: number
  /** 1~12 */
  month1: number
}

/** 세로 스크롤 목록의 각 월을 식별하는 키 ('2026-6') */
export function monthKey(year: number, month1: number): string {
  return `${year}-${month1}`
}

/** (baseYear, baseMonth1) 기준 before개월 전 ~ after개월 후까지의 (연,월)을 시간순으로 나열한다. */
export function monthRange(
  baseYear: number,
  baseMonth1: number,
  before: number,
  after: number,
): YearMonth[] {
  const base = baseYear * 12 + (baseMonth1 - 1) // 절대 월 인덱스(0=서기 1월)
  const out: YearMonth[] = []
  for (let i = -before; i <= after; i++) {
    const abs = base + i
    out.push({ year: Math.floor(abs / 12), month1: (abs % 12) + 1 })
  }
  return out
}

/** 전체 일정에서 해당 (연,월)에 시작하는 것만 추려 day/endDay 를 파생해 붙인다. */
export function eventsForMonth(events: CalEvent[], year: number, month1: number): DayEvent[] {
  return events
    .filter((e) => {
      const [ey, em] = e.date.split('-').map(Number)
      return ey === year && em === month1
    })
    .map((e) => ({
      ...e,
      day: Number(e.date.split('-')[2]),
      endDay: e.endDate ? Number(e.endDate.split('-')[2]) : undefined,
    }))
}

export function calColor(cat: CatKey, colorMode: ColorMode): string {
  const meta = CATS[cat]
  if (colorMode === 'binary') return meta.type === 'tax' ? 'var(--book-cloth)' : 'var(--cat-personal)'
  if (colorMode === 'mono') return meta.type === 'tax' ? 'var(--cloud-medium)' : 'var(--ui-blue-soft)'
  return meta.color
}
