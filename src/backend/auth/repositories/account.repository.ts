// 계정 데이터 접근 계층 (repository)
// prisma만 import 한다. 비즈니스 로직 금지 — 순수 CRUD만 수행.
import { prisma } from '../../shared/prisma'
import type { Account } from '../auth.types'

// email로 단건 조회 (없으면 null)
export function findByEmail(email: string): Promise<Account | null> {
  return prisma.account.findUnique({ where: { email } })
}

// id로 단건 조회 (없으면 null)
export function findById(id: number): Promise<Account | null> {
  return prisma.account.findUnique({ where: { id } })
}
