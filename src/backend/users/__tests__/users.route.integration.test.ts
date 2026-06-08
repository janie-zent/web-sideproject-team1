// 라우트 통합 테스트 (3순위)
// 실제 SQLite(임시 파일 DB) + Prisma로 login → me → 목록/생성/조회/수정/삭제 흐름을 검증한다.
// prisma 싱글턴은 생성 시점에 DATABASE_URL을 읽으므로, route/prisma 모듈을 import 하기 전에
// 환경변수를 세팅하고 스키마를 push 한 뒤 동적 import 한다.
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import bcrypt from 'bcryptjs'

// 임시 DB 디렉토리/파일 경로
const tempDir = mkdtempSync(join(tmpdir(), 'side-project-itest-'))
const dbFile = join(tempDir, 'itest.db')

// 라우트/서비스/prisma 모듈은 환경 세팅 후 동적 import 한다.
type RouteModule = typeof import('@/app/api/v1/admin/users/route')
type LoginRouteModule = typeof import('@/app/api/v1/admin/users/login/route')
type MeRouteModule = typeof import('@/app/api/v1/admin/users/me/route')
type IdRouteModule = typeof import('@/app/api/v1/admin/users/[id]/route')
type PrismaModule = typeof import('@/backend/shared/prisma')

let usersRoute: RouteModule
let loginRoute: LoginRouteModule
let meRoute: MeRouteModule
let idRoute: IdRouteModule
let prismaModule: PrismaModule

// JSON 본문 + Authorization 헤더를 갖춘 Request를 만든다.
function jsonRequest(
  url: string,
  method: string,
  body?: unknown,
  token?: string,
): Request {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (token) {
    headers.authorization = `Bearer ${token}`
  }
  return new Request(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

beforeAll(async () => {
  // 1) prisma 싱글턴 생성 전에 환경변수 세팅
  process.env.DATABASE_URL = `file:${dbFile}`
  process.env.JWT_SECRET = 'itest-secret'

  // 2) 임시 DB에 스키마 반영 (마이그레이션 대신 db push — 빠르고 단순)
  execFileSync('node_modules/.bin/prisma', ['db', 'push', '--skip-generate'], {
    env: { ...process.env, DATABASE_URL: `file:${dbFile}` },
    stdio: 'pipe',
  })

  // 3) 환경 세팅 후 모듈 동적 import (이제 prisma 싱글턴이 임시 DB를 바라본다)
  prismaModule = await import('@/backend/shared/prisma')
  usersRoute = await import('@/app/api/v1/admin/users/route')
  loginRoute = await import('@/app/api/v1/admin/users/login/route')
  meRoute = await import('@/app/api/v1/admin/users/me/route')
  idRoute = await import('@/app/api/v1/admin/users/[id]/route')

  // 4) admin/1234 시드
  const hashed = await bcrypt.hash('1234', 10)
  await prismaModule.prisma.user.create({
    data: { username: 'admin', password: hashed, name: '관리자' },
  })
}, 30000)

afterAll(async () => {
  if (prismaModule) {
    await prismaModule.prisma.$disconnect()
  }
  rmSync(tempDir, { recursive: true, force: true })
})

describe('login → me 흐름', () => {
  it('잘못된 비밀번호 로그인은 401', async () => {
    const response = await loginRoute.POST(
      jsonRequest('http://test/login', 'POST', { username: 'admin', password: 'wrong' }),
    )
    expect(response.status).toBe(401)
    const json = await response.json()
    expect(json.result).toBe(false)
  })

  it('올바른 로그인은 token을 반환하고, 그 토큰으로 me 조회가 된다', async () => {
    const loginResponse = await loginRoute.POST(
      jsonRequest('http://test/login', 'POST', { username: 'admin', password: '1234' }),
    )
    expect(loginResponse.status).toBe(200)
    const loginJson = await loginResponse.json()
    expect(loginJson.result).toBe(true)
    expect(typeof loginJson.token).toBe('string')

    const meResponse = await meRoute.GET(
      jsonRequest('http://test/me', 'GET', undefined, loginJson.token),
    )
    expect(meResponse.status).toBe(200)
    const meJson = await meResponse.json()
    expect(meJson.data.username).toBe('admin')
    // password가 응답에 절대 포함되지 않아야 한다.
    expect(meJson.data).not.toHaveProperty('password')
  })

  it('토큰 없이 me 조회는 401', async () => {
    const response = await meRoute.GET(jsonRequest('http://test/me', 'GET'))
    expect(response.status).toBe(401)
  })
})

describe('CRUD 흐름 (인증된 상태)', () => {
  let token: string

  beforeAll(async () => {
    const loginResponse = await loginRoute.POST(
      jsonRequest('http://test/login', 'POST', { username: 'admin', password: '1234' }),
    )
    token = (await loginResponse.json()).token
  })

  it('사용자 생성 → 목록 → 조회 → 수정 → 삭제', async () => {
    // 생성
    const createResponse = await usersRoute.POST(
      jsonRequest('http://test/users', 'POST', { username: 'tester', password: 'pw', name: '테스터' }, token),
    )
    expect(createResponse.status).toBe(201)
    const created = (await createResponse.json()).data
    expect(created.username).toBe('tester')
    expect(created).not.toHaveProperty('password')
    const newId = created.id

    // 중복 생성은 409
    const dupResponse = await usersRoute.POST(
      jsonRequest('http://test/users', 'POST', { username: 'tester', password: 'pw' }, token),
    )
    expect(dupResponse.status).toBe(409)

    // 목록 (admin + tester = 2명)
    const listResponse = await usersRoute.GET(
      jsonRequest('http://test/users', 'GET', undefined, token),
    )
    expect(listResponse.status).toBe(200)
    const list = (await listResponse.json()).data
    expect(list.length).toBeGreaterThanOrEqual(2)
    list.forEach((dto: Record<string, unknown>) => expect(dto).not.toHaveProperty('password'))

    // 단건 조회
    const getResponse = await idRoute.GET(
      jsonRequest(`http://test/users/${newId}`, 'GET', undefined, token),
      { params: { id: String(newId) } },
    )
    expect(getResponse.status).toBe(200)
    expect((await getResponse.json()).data.username).toBe('tester')

    // 수정 (이름 변경)
    const patchResponse = await idRoute.PATCH(
      jsonRequest(`http://test/users/${newId}`, 'PATCH', { name: '바뀐테스터' }, token),
      { params: { id: String(newId) } },
    )
    expect(patchResponse.status).toBe(200)
    expect((await patchResponse.json()).data.name).toBe('바뀐테스터')

    // 비밀번호 변경 후 새 비번으로 로그인 가능 확인
    const pwPatch = await idRoute.PATCH(
      jsonRequest(`http://test/users/${newId}`, 'PATCH', { password: 'newpw' }, token),
      { params: { id: String(newId) } },
    )
    expect(pwPatch.status).toBe(200)
    const reLogin = await loginRoute.POST(
      jsonRequest('http://test/login', 'POST', { username: 'tester', password: 'newpw' }),
    )
    expect(reLogin.status).toBe(200)

    // 삭제
    const deleteResponse = await idRoute.DELETE(
      jsonRequest(`http://test/users/${newId}`, 'DELETE', undefined, token),
      { params: { id: String(newId) } },
    )
    expect(deleteResponse.status).toBe(200)

    // 삭제 후 조회는 404
    const getAfterDelete = await idRoute.GET(
      jsonRequest(`http://test/users/${newId}`, 'GET', undefined, token),
      { params: { id: String(newId) } },
    )
    expect(getAfterDelete.status).toBe(404)
  })

  it('없는 id 조회는 404', async () => {
    const response = await idRoute.GET(
      jsonRequest('http://test/users/99999', 'GET', undefined, token),
      { params: { id: '99999' } },
    )
    expect(response.status).toBe(404)
  })

  it('유효하지 않은 id(0)는 400', async () => {
    const response = await idRoute.GET(
      jsonRequest('http://test/users/0', 'GET', undefined, token),
      { params: { id: '0' } },
    )
    expect(response.status).toBe(400)
  })
})
