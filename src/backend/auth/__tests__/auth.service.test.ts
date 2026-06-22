// auth.service 단위 테스트
// account.repository를 mock하여 service 비즈니스 로직만 검증한다 (DB 의존 없음).
// password는 실제 shared/password(bcrypt)를 그대로 사용해 해시/검증 계약까지 확인한다.
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'

// repository 계층 전체를 mock으로 대체한다. service는 repository만 의존하므로 깔끔히 분리된다.
vi.mock('../repositories/account.repository', () => ({
  findByEmail: vi.fn(),
  findById: vi.fn(),
}))

import * as accountRepository from '../repositories/account.repository'
import * as authService from '../services/auth.service'
import { hashPassword } from '../../shared/password'
import { verifyToken } from '../../shared/jwt'
import { AppError } from '../../shared/errors'
import type { Account } from '../auth.types'

// mock된 repository 함수에 타입 안전하게 접근하기 위한 헬퍼
const mockedRepo = vi.mocked(accountRepository)

// 테스트용 Account 엔티티 팩토리 (password는 호출부에서 해시하여 주입)
function buildAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: 1,
    email: 'user@olchaengi.app',
    password: 'hashed',
    name: '김도윤',
    bizName: '도윤상사',
    bizNo: '124-81-00567',
    plan: 'pro',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  }
}

beforeAll(() => {
  // jwt 발급에 필요
  process.env.JWT_SECRET = 'test-secret'
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('login', () => {
  it('올바른 자격이면 검증 가능한 토큰을 발급한다 (sub=id, username=email)', async () => {
    const hashedPassword = await hashPassword('1234')
    mockedRepo.findByEmail.mockResolvedValue(buildAccount({ id: 7, password: hashedPassword }))

    const token = await authService.login({ email: 'user@olchaengi.app', password: '1234' })

    expect(typeof token).toBe('string')
    const payload = verifyToken(token)
    expect(payload.sub).toBe(7)
    expect(payload.username).toBe('user@olchaengi.app')
  })

  it('없는 email이면 401 INVALID_CREDENTIALS', async () => {
    mockedRepo.findByEmail.mockResolvedValue(null)

    await expect(
      authService.login({ email: 'nobody@x.com', password: 'x' }),
    ).rejects.toMatchObject({ status: 401, code: 'INVALID_CREDENTIALS' })
  })

  it('비밀번호가 틀리면 401 INVALID_CREDENTIALS', async () => {
    const hashedPassword = await hashPassword('1234')
    mockedRepo.findByEmail.mockResolvedValue(buildAccount({ password: hashedPassword }))

    await expect(
      authService.login({ email: 'user@olchaengi.app', password: 'wrong' }),
    ).rejects.toBeInstanceOf(AppError)
  })

  it('login 토큰 payload에 password를 노출하지 않는다', async () => {
    const hashedPassword = await hashPassword('1234')
    mockedRepo.findByEmail.mockResolvedValue(buildAccount({ password: hashedPassword }))

    const token = await authService.login({ email: 'user@olchaengi.app', password: '1234' })
    const payload = verifyToken(token) as unknown as Record<string, unknown>
    expect(payload).not.toHaveProperty('password')
  })
})

describe('getMe', () => {
  it('존재하는 계정이면 password 없는 DTO를 반환한다', async () => {
    mockedRepo.findById.mockResolvedValue(buildAccount({ id: 3 }))

    const dto = await authService.getMe(3)

    expect(dto).toEqual({
      id: 3,
      email: 'user@olchaengi.app',
      name: '김도윤',
      bizName: '도윤상사',
      bizNo: '124-81-00567',
      plan: 'pro',
      createdAt: '2026-01-01T00:00:00.000Z',
    })
    expect(dto).not.toHaveProperty('password')
  })

  it('없는 계정이면 404 ACCOUNT_NOT_FOUND', async () => {
    mockedRepo.findById.mockResolvedValue(null)
    await expect(authService.getMe(999)).rejects.toMatchObject({
      status: 404,
      code: 'ACCOUNT_NOT_FOUND',
    })
  })
})
