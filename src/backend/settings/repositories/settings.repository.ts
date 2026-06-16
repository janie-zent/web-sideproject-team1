// 설정 데이터 접근 계층 (repository)
// prisma만 import 한다. 비즈니스 로직 금지 — 순수 CRUD만 수행.
import { prisma } from '../../shared/prisma'
import type { Settings } from '../settings.types'

// 단일 행 id (1인 사용자 — 항상 1)
const SETTINGS_ID = 1

// 단일 설정 행 조회 (없으면 null)
export function findSingleton(): Promise<Settings | null> {
  return prisma.settings.findUnique({ where: { id: SETTINGS_ID } })
}

// 부분 업데이트 입력
interface UpdateData {
  pushEnabled?: boolean
  emailEnabled?: boolean
  kakaoEnabled?: boolean
  smsEnabled?: boolean
  taxAutoNotify?: boolean
  defaultRemind?: string
  showTax?: boolean
  weekStart?: number
}

// 단일 설정 행을 갱신한다. 행이 없으면 기본값으로 생성 후 갱신 (멱등 보장).
export function upsertSingleton(data: UpdateData): Promise<Settings> {
  return prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    update: data,
    create: { id: SETTINGS_ID, ...data },
  })
}
