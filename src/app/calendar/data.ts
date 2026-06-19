/* 올챙이 — 캘린더 도메인 타입 · 카테고리 메타 · 상수.
   더미(목업) 일정 데이터는 ./mock-events.ts 로 분리되어 있습니다. */

export type CatKey =
  | 'vat'
  | 'with'
  | 'income'
  | 'corp'
  | 'insure'
  | 'personal'

export type ColorMode = 'category' | 'binary' | 'mono'
export type ChipStyle = 'bar' | 'fill' | 'dot'

export interface Cat {
  label: string
  short: string
  type: 'tax' | 'personal'
  color: string
}

export interface CalEvent {
  id: string
  /** 시작일 ISO 'YYYY-MM-DD' */
  date: string
  /** 멀티데이 종료일 ISO 'YYYY-MM-DD' (시작일과 같은 달 가정) */
  endDate?: string
  cat: CatKey
  title: string
  time: string | null
  done?: boolean
  allday?: boolean
  desc: string
  /** 세무 일정의 신고·납부 주기 (일정 상세에 노출). 개인 일정은 없음. */
  cycle?: string
}

/** 목업 데이터의 기준 연도 + 초기 표시 월. 더미데이터는 이 연도의 4~8월에 분포한다. */
export const DATA_YEAR = 2026
export const DATA_MONTH = 6 // 1~12 (초기 표시 월)

// 카테고리 메타 — 색상 토큰 + 라벨 + 세무/개인 구분
export const CATS: Record<CatKey, Cat> = {
  vat: { label: '부가가치세', short: '부가세', type: 'tax', color: 'var(--cat-vat)' },
  with: { label: '원천세', short: '원천세', type: 'tax', color: 'var(--cat-with)' },
  income: { label: '종합소득세', short: '소득세', type: 'tax', color: 'var(--cat-income)' },
  corp: { label: '법인세', short: '법인세', type: 'tax', color: 'var(--cat-corp)' },
  insure: { label: '4대보험·지방세', short: '4대보험', type: 'tax', color: 'var(--cat-insure)' },
  personal: { label: '개인 일정', short: '개인', type: 'personal', color: 'var(--cat-personal)' },
}

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const
