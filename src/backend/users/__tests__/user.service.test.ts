// user.service 단위 테스트
// repository를 mock하여 service 비즈니스 로직만 검증한다 (DB 의존 없음).
// password는 실제 shared/password(bcrypt)를 그대로 사용해 해시/검증 계약까지 확인한다.
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'

// repository 계층 전체를 mock으로 대체한다. service는 repository만 의존하므로 깔끔히 분리된다.
vi.mock('../repositories/user.repository', () => ({
  findByUsername: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}))

import * as userRepository from '../repositories/user.repository'
import * as userService from '../services/user.service'
import { hashPassword } from '../../shared/password'
import { verifyToken } from '../../shared/jwt'
import { AppError } from '../../shared/errors'
import type { User } from '../user.types'

// mock된 repository 함수에 타입 안전하게 접근하기 위한 헬퍼
const mockedRepo = vi.mocked(userRepository)

// 테스트용 User 엔티티 팩토리 (password는 호출부에서 해시하여 주입)
function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    username: 'admin',
    password: 'hashed',
    name: '관리자',
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
  it('올바른 자격이면 검증 가능한 토큰을 발급한다', async () => {
    const hashedPassword = await hashPassword('1234')
    mockedRepo.findByUsername.mockResolvedValue(buildUser({ id: 7, password: hashedPassword }))

    const token = await userService.login({ username: 'admin', password: '1234' })

    expect(typeof token).toBe('string')
    const payload = verifyToken(token)
    expect(payload.sub).toBe(7)
    expect(payload.username).toBe('admin')
  })

  it('없는 username이면 401 INVALID_CREDENTIALS', async () => {
    mockedRepo.findByUsername.mockResolvedValue(null)

    await expect(userService.login({ username: 'nobody', password: 'x' })).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_CREDENTIALS',
    })
  })

  it('비밀번호가 틀리면 401 INVALID_CREDENTIALS', async () => {
    const hashedPassword = await hashPassword('1234')
    mockedRepo.findByUsername.mockResolvedValue(buildUser({ password: hashedPassword }))

    await expect(
      userService.login({ username: 'admin', password: 'wrong' }),
    ).rejects.toBeInstanceOf(AppError)
  })

  it('login 반환값(token)은 문자열이며 password를 노출하지 않는다', async () => {
    const hashedPassword = await hashPassword('1234')
    mockedRepo.findByUsername.mockResolvedValue(buildUser({ password: hashedPassword }))

    const token = await userService.login({ username: 'admin', password: '1234' })
    // 토큰 payload에 password 키가 없어야 한다.
    const payload = verifyToken(token) as unknown as Record<string, unknown>
    expect(payload).not.toHaveProperty('password')
  })
})

describe('getMe / getUser', () => {
  it('getMe: 존재하는 사용자면 password 없는 DTO를 반환한다', async () => {
    mockedRepo.findById.mockResolvedValue(buildUser({ id: 3 }))

    const dto = await userService.getMe(3)

    expect(dto).toEqual({
      id: 3,
      username: 'admin',
      name: '관리자',
      createdAt: '2026-01-01T00:00:00.000Z',
    })
    expect(dto).not.toHaveProperty('password')
  })

  it('getMe: 없는 사용자면 404 USER_NOT_FOUND', async () => {
    mockedRepo.findById.mockResolvedValue(null)
    await expect(userService.getMe(999)).rejects.toMatchObject({
      status: 404,
      code: 'USER_NOT_FOUND',
    })
  })

  it('getUser: 없는 id면 404 USER_NOT_FOUND', async () => {
    mockedRepo.findById.mockResolvedValue(null)
    await expect(userService.getUser(999)).rejects.toMatchObject({
      status: 404,
      code: 'USER_NOT_FOUND',
    })
  })
})

describe('listUsers', () => {
  it('모든 사용자를 password 없는 DTO 배열로 반환한다', async () => {
    mockedRepo.findAll.mockResolvedValue([
      buildUser({ id: 1, username: 'a' }),
      buildUser({ id: 2, username: 'b', name: null }),
    ])

    const list = await userService.listUsers()

    expect(list).toHaveLength(2)
    list.forEach((dto) => expect(dto).not.toHaveProperty('password'))
    expect(list[0].username).toBe('a')
    expect(list[1].name).toBeNull()
  })
})

describe('createUser', () => {
  it('username이 중복이면 409 USERNAME_TAKEN (생성 시도 안 함)', async () => {
    mockedRepo.findByUsername.mockResolvedValue(buildUser())

    await expect(
      userService.createUser({ username: 'admin', password: '1234' }),
    ).rejects.toMatchObject({ status: 409, code: 'USERNAME_TAKEN' })
    expect(mockedRepo.create).not.toHaveBeenCalled()
  })

  it('정상 생성 시 비밀번호를 해시하여 저장하고 password 없는 DTO를 반환한다', async () => {
    mockedRepo.findByUsername.mockResolvedValue(null)
    mockedRepo.create.mockImplementation(async (data) =>
      buildUser({ id: 10, username: data.username, password: data.password, name: data.name ?? null }),
    )

    const dto = await userService.createUser({ username: 'newbie', password: '1234', name: '신규' })

    // repository.create에 넘긴 password는 평문이 아니라 해시여야 한다.
    expect(mockedRepo.create).toHaveBeenCalledTimes(1)
    const createArg = mockedRepo.create.mock.calls[0][0]
    expect(createArg.password).not.toBe('1234')
    expect(createArg.password).toMatch(/^\$2[aby]\$/)
    // 반환 DTO에는 password가 없어야 한다.
    expect(dto).not.toHaveProperty('password')
    expect(dto.username).toBe('newbie')
  })

  it('name 미전달 시 repository에 name: null로 전달한다', async () => {
    mockedRepo.findByUsername.mockResolvedValue(null)
    mockedRepo.create.mockImplementation(async (data) =>
      buildUser({ id: 11, username: data.username, name: data.name ?? null }),
    )

    await userService.createUser({ username: 'noname', password: '1234' })

    expect(mockedRepo.create.mock.calls[0][0].name).toBeNull()
  })
})

describe('updateUser', () => {
  it('없는 id면 404 USER_NOT_FOUND (수정 시도 안 함)', async () => {
    mockedRepo.findById.mockResolvedValue(null)
    await expect(userService.updateUser(999, { name: 'x' })).rejects.toMatchObject({
      status: 404,
      code: 'USER_NOT_FOUND',
    })
    expect(mockedRepo.update).not.toHaveBeenCalled()
  })

  it('이름만 변경하면 password는 update 데이터에 포함되지 않는다', async () => {
    mockedRepo.findById.mockResolvedValue(buildUser({ id: 5 }))
    mockedRepo.update.mockImplementation(async (id, data) =>
      buildUser({ id, name: data.name ?? null }),
    )

    await userService.updateUser(5, { name: '바뀐이름' })

    const updateArg = mockedRepo.update.mock.calls[0][1]
    expect(updateArg).toHaveProperty('name', '바뀐이름')
    expect(updateArg).not.toHaveProperty('password')
  })

  it('비밀번호 변경 시 해시를 적용하여 update에 전달한다', async () => {
    mockedRepo.findById.mockResolvedValue(buildUser({ id: 5 }))
    mockedRepo.update.mockImplementation(async (id) => buildUser({ id }))

    await userService.updateUser(5, { password: 'newpass' })

    const updateArg = mockedRepo.update.mock.calls[0][1]
    expect(updateArg.password).toBeDefined()
    expect(updateArg.password).not.toBe('newpass')
    expect(updateArg.password).toMatch(/^\$2[aby]\$/)
  })

  it('수정 결과 DTO에는 password가 없다', async () => {
    mockedRepo.findById.mockResolvedValue(buildUser({ id: 5 }))
    mockedRepo.update.mockResolvedValue(buildUser({ id: 5, name: '바뀐이름' }))

    const dto = await userService.updateUser(5, { name: '바뀐이름' })
    expect(dto).not.toHaveProperty('password')
  })
})

describe('deleteUser', () => {
  it('없는 id면 404 USER_NOT_FOUND (삭제 시도 안 함)', async () => {
    mockedRepo.findById.mockResolvedValue(null)
    await expect(userService.deleteUser(999)).rejects.toMatchObject({
      status: 404,
      code: 'USER_NOT_FOUND',
    })
    expect(mockedRepo.remove).not.toHaveBeenCalled()
  })

  it('존재하면 repository.remove를 호출하고 void를 반환한다', async () => {
    mockedRepo.findById.mockResolvedValue(buildUser({ id: 8 }))
    mockedRepo.remove.mockResolvedValue(buildUser({ id: 8 }))

    const result = await userService.deleteUser(8)

    expect(result).toBeUndefined()
    expect(mockedRepo.remove).toHaveBeenCalledWith(8)
  })
})
