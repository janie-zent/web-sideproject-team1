// 사용자 데이터 접근 계층 (repository)
// prisma만 import 한다. 해싱/검증 등 비즈니스 로직 금지 — 순수 CRUD만 수행.
import { prisma } from '../../shared/prisma'
import type { User } from '../user.types'

// username으로 단건 조회 (없으면 null)
export function findByUsername(username: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { username } })
}

// id로 단건 조회 (없으면 null)
export function findById(id: number): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } })
}

// 전체 목록 조회 (생성일 오름차순)
export function findAll(): Promise<User[]> {
  return prisma.user.findMany({ orderBy: { id: 'asc' } })
}

// 생성 입력 (password는 해시된 값이 들어온다 — 해싱은 service 책임)
interface CreateData {
  username: string
  password: string
  name?: string | null
}

// 사용자 생성
export function create(data: CreateData): Promise<User> {
  return prisma.user.create({ data })
}

// 수정 입력 (password는 해시된 값)
interface UpdateData {
  name?: string | null
  password?: string
}

// 사용자 수정
export function update(id: number, data: UpdateData): Promise<User> {
  return prisma.user.update({ where: { id }, data })
}

// 사용자 삭제
export function remove(id: number): Promise<User> {
  return prisma.user.delete({ where: { id } })
}
