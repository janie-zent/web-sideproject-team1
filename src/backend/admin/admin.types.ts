// 관리자 도메인 타입 단일 출처. (전부 더미 — DB 미반영)
import type { CategoryKey } from '../events/event.types'

// 관리자 회원 목록 항목
export interface MemberDto {
  id: string
  name: string
  biz: string // 사업자명
  bizno: string // 사업자번호
  type: string // '법인' | '개인'
  plan: string // '베이직' | '프로' | '엔터프라이즈'
  status: string // 'active' | 'dormant' | 'paused'
  joined: string
  last: string
}

// 관리자 세무일정 마스터 항목 (관리자 화면용 — 회원 EventDto와 별개 형태)
export interface AdminTaxScheduleDto {
  id: string
  cat: CategoryKey
  title: string
  period: string
  source: string // 'api' | 'manual'
  cycle: string
  updated: string
}

// 세무일정 등록/수정 입력 (더미 — echo 용)
export interface AdminTaxScheduleInput {
  cat?: CategoryKey
  title?: string
  period?: string
  source?: string
  cycle?: string
}

// 발송 알림 내역 항목
export interface SentDto {
  id: string
  title: string
  cat: CategoryKey
  recipients: number
  read: number
  channel: string
  sent: string
}

// 알림 발송 입력 (더미 — echo 용)
export interface SendInput {
  title?: string
  cat?: CategoryKey
  channel?: string
}

// 대시보드 통계 카드
export interface DashboardStatDto {
  totalMembers: number // 전체 회원
  totalTaxSchedules: number // 등록 세무일정
  totalSent: number // 발송 알림
  avgReadRate: number // 평균 확인율 (0~100, 소수 1자리)
}

// 월별 발송 차트 항목
export interface MonthlySentDto {
  month: string // 예 '2026-01'
  count: number
}

// 예정 세무일정 미리보기 항목
export interface UpcomingTaxDto {
  id: string
  cat: CategoryKey
  title: string
  period: string
}

// 대시보드 응답 묶음
export interface DashboardDto {
  stats: DashboardStatDto
  monthlySent: MonthlySentDto[]
  upcoming: UpcomingTaxDto[]
}
