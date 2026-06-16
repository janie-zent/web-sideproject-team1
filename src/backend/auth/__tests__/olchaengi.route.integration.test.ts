// 올챙이 라우트 통합 테스트
// 실제 SQLite(임시 파일 DB) + Prisma로 핵심 경로를 검증한다:
//  - 인증 없을 때 401
//  - login → 토큰 → 보호 라우트(me) 호출
//  - events 생성/조회 happy path
//  - settings 부분 업데이트, notifications 읽음/모두읽음, tax 월 조회
// prisma 싱글턴은 생성 시점에 DATABASE_URL을 읽으므로, 모듈 import 전에 환경변수 세팅 + db push 후 동적 import 한다.
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import bcrypt from 'bcryptjs'

// 임시 DB 디렉토리/파일 경로
const tempDir = mkdtempSync(join(tmpdir(), 'olchaengi-itest-'))
const dbFile = join(tempDir, 'itest.db')

// 라우트/prisma 모듈은 환경 세팅 후 동적 import 한다.
type SessionsRouteModule = typeof import('@/app/api/v1/auth/sessions/route')
type MeRouteModule = typeof import('@/app/api/v1/auth/me/route')
type EventsRouteModule = typeof import('@/app/api/v1/events/route')
type EventIdRouteModule = typeof import('@/app/api/v1/events/[id]/route')
type SettingsRouteModule = typeof import('@/app/api/v1/settings/route')
type NotificationsRouteModule = typeof import('@/app/api/v1/notifications/route')
type NotificationIdRouteModule = typeof import('@/app/api/v1/notifications/[id]/route')
type TaxRouteModule = typeof import('@/app/api/v1/tax-schedules/route')
type MembersRouteModule = typeof import('@/app/api/v1/admin/members/route')
type PrismaModule = typeof import('@/backend/shared/prisma')

let sessionsRoute: SessionsRouteModule
let meRoute: MeRouteModule
let eventsRoute: EventsRouteModule
let eventIdRoute: EventIdRouteModule
let settingsRoute: SettingsRouteModule
let notificationsRoute: NotificationsRouteModule
let notificationIdRoute: NotificationIdRouteModule
let taxRoute: TaxRouteModule
let membersRoute: MembersRouteModule
let prismaModule: PrismaModule

// JSON 본문 + Authorization 헤더를 갖춘 Request를 만든다.
function jsonRequest(url: string, method: string, body?: unknown, token?: string): Request {
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

const ACCOUNT_EMAIL = 'user@olchaengi.app'

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
  sessionsRoute = await import('@/app/api/v1/auth/sessions/route')
  meRoute = await import('@/app/api/v1/auth/me/route')
  eventsRoute = await import('@/app/api/v1/events/route')
  eventIdRoute = await import('@/app/api/v1/events/[id]/route')
  settingsRoute = await import('@/app/api/v1/settings/route')
  notificationsRoute = await import('@/app/api/v1/notifications/route')
  notificationIdRoute = await import('@/app/api/v1/notifications/[id]/route')
  taxRoute = await import('@/app/api/v1/tax-schedules/route')
  membersRoute = await import('@/app/api/v1/admin/members/route')

  // 4) 단일 계정 시드 (user@olchaengi.app / 1234)
  const hashed = await bcrypt.hash('1234', 10)
  await prismaModule.prisma.account.create({
    data: { email: ACCOUNT_EMAIL, password: hashed, name: '김도윤', plan: 'pro' },
  })

  // 세무 일정 1건 시드 (2026-06 월 조회 검증용)
  await prismaModule.prisma.taxSchedule.create({
    data: {
      cat: 'with',
      title: '원천세 신고·납부',
      period: '매월 10일',
      source: 'api',
      cycle: '매월',
      updated: '2026.06.01',
      startDate: '2026-06-10',
    },
  })

  // 알림 1건 시드 (읽음 처리 검증용)
  await prismaModule.prisma.notification.create({
    data: { cat: 'with', title: '알림', body: '본문', when: '오늘 09:00', unread: true },
  })
}, 30000)

afterAll(async () => {
  if (prismaModule) {
    await prismaModule.prisma.$disconnect()
  }
  rmSync(tempDir, { recursive: true, force: true })
})

describe('인증 (sessions → me)', () => {
  it('토큰 없이 보호 라우트(me) 호출은 401', async () => {
    const response = await meRoute.GET(jsonRequest('http://test/auth/me', 'GET'))
    expect(response.status).toBe(401)
  })

  it('잘못된 비밀번호 세션 생성은 401', async () => {
    const response = await sessionsRoute.POST(
      jsonRequest('http://test/auth/sessions', 'POST', { email: ACCOUNT_EMAIL, password: 'wrong' }),
    )
    expect(response.status).toBe(401)
    expect((await response.json()).result).toBe(false)
  })

  it('email/password 누락은 400', async () => {
    const response = await sessionsRoute.POST(
      jsonRequest('http://test/auth/sessions', 'POST', { email: ACCOUNT_EMAIL }),
    )
    expect(response.status).toBe(400)
  })

  it('올바른 세션 생성은 token을 반환하고, 그 토큰으로 me 조회가 된다', async () => {
    const loginResponse = await sessionsRoute.POST(
      jsonRequest('http://test/auth/sessions', 'POST', { email: ACCOUNT_EMAIL, password: '1234' }),
    )
    expect(loginResponse.status).toBe(200)
    const loginJson = await loginResponse.json()
    expect(loginJson.result).toBe(true)
    expect(typeof loginJson.token).toBe('string')

    const meResponse = await meRoute.GET(
      jsonRequest('http://test/auth/me', 'GET', undefined, loginJson.token),
    )
    expect(meResponse.status).toBe(200)
    const meJson = await meResponse.json()
    expect(meJson.data.email).toBe(ACCOUNT_EMAIL)
    // password가 응답에 절대 포함되지 않아야 한다.
    expect(meJson.data).not.toHaveProperty('password')
  })

  it('세션 폐기(로그아웃): 토큰 없으면 401, 인증되면 200', async () => {
    const noTokenResponse = await sessionsRoute.DELETE(
      jsonRequest('http://test/auth/sessions', 'DELETE'),
    )
    expect(noTokenResponse.status).toBe(401)

    const loginResponse = await sessionsRoute.POST(
      jsonRequest('http://test/auth/sessions', 'POST', { email: ACCOUNT_EMAIL, password: '1234' }),
    )
    const token = (await loginResponse.json()).token
    const logoutResponse = await sessionsRoute.DELETE(
      jsonRequest('http://test/auth/sessions', 'DELETE', undefined, token),
    )
    expect(logoutResponse.status).toBe(200)
    expect((await logoutResponse.json()).result).toBe(true)
  })
})

describe('보호된 도메인 라우트 (인증된 상태)', () => {
  let token: string

  beforeAll(async () => {
    const loginResponse = await sessionsRoute.POST(
      jsonRequest('http://test/auth/sessions', 'POST', { email: ACCOUNT_EMAIL, password: '1234' }),
    )
    token = (await loginResponse.json()).token
  })

  it('events: 토큰 없으면 401', async () => {
    const response = await eventsRoute.GET(jsonRequest('http://test/events?year=2026&month=6', 'GET'))
    expect(response.status).toBe(401)
  })

  it('events: 생성(201) → 월 조회 → 단건 조회 happy path', async () => {
    // 생성
    const createResponse = await eventsRoute.POST(
      jsonRequest(
        'http://test/events',
        'POST',
        { title: '거래처 입금 확인', startDate: '2026-06-10', time: '11:00' },
        token,
      ),
    )
    expect(createResponse.status).toBe(201)
    const created = (await createResponse.json()).data
    expect(created.source).toBe('personal')
    expect(created.editable).toBe(true)
    // id는 p 접두어 문자열이어야 한다.
    expect(created.id).toMatch(/^p\d+$/)
    const createdId = created.id

    // 월 조회 (생성한 일정이 포함되어야 한다)
    const listResponse = await eventsRoute.GET(
      jsonRequest('http://test/events?year=2026&month=6', 'GET', undefined, token),
    )
    expect(listResponse.status).toBe(200)
    const list = (await listResponse.json()).data
    expect(list.some((event: { id: string }) => event.id === createdId)).toBe(true)

    // 단건 조회 (p 접두어 포함 id로 호출)
    const getResponse = await eventIdRoute.GET(
      jsonRequest(`http://test/events/${createdId}`, 'GET', undefined, token),
      { params: { id: createdId } },
    )
    expect(getResponse.status).toBe(200)
    expect((await getResponse.json()).data.id).toBe(createdId)
  })

  it('events: 제목/시작일 누락 생성은 400', async () => {
    const response = await eventsRoute.POST(
      jsonRequest('http://test/events', 'POST', { title: '제목만' }, token),
    )
    expect(response.status).toBe(400)
  })

  it('events: 잘못된 year/month는 400', async () => {
    const response = await eventsRoute.GET(
      jsonRequest('http://test/events?year=2026&month=13', 'GET', undefined, token),
    )
    expect(response.status).toBe(400)
  })

  it('events: 없는 id 조회는 404', async () => {
    const response = await eventIdRoute.GET(
      jsonRequest('http://test/events/p99999', 'GET', undefined, token),
      { params: { id: 'p99999' } },
    )
    expect(response.status).toBe(404)
  })

  it('settings: 조회 후 부분 업데이트가 반영된다', async () => {
    const getResponse = await settingsRoute.GET(
      jsonRequest('http://test/settings', 'GET', undefined, token),
    )
    expect(getResponse.status).toBe(200)
    expect((await getResponse.json()).data.id).toBe(1)

    const patchResponse = await settingsRoute.PATCH(
      jsonRequest('http://test/settings', 'PATCH', { kakaoEnabled: true }, token),
    )
    expect(patchResponse.status).toBe(200)
    const patched = (await patchResponse.json()).data
    expect(patched.kakaoEnabled).toBe(true)
    // 전달하지 않은 값은 기존값을 유지한다.
    expect(patched.pushEnabled).toBe(true)
  })

  it('notifications: 목록 → 단건 읽음 → 모두 읽음', async () => {
    const listResponse = await notificationsRoute.GET(
      jsonRequest('http://test/notifications?filter=all', 'GET', undefined, token),
    )
    expect(listResponse.status).toBe(200)
    const list = (await listResponse.json()).data
    expect(list.length).toBeGreaterThanOrEqual(1)
    const firstId = list[0].id // 'n1' 형태

    // 단건 상태 변경 (n 접두어 포함 id + body { unread: false })
    const readResponse = await notificationIdRoute.PATCH(
      jsonRequest(`http://test/notifications/${firstId}`, 'PATCH', { unread: false }, token),
      { params: { id: firstId } },
    )
    expect(readResponse.status).toBe(200)
    expect((await readResponse.json()).data.unread).toBe(false)

    // 모두 읽음 (컬렉션 PATCH) → { updated: n }
    const readAllResponse = await notificationsRoute.PATCH(
      jsonRequest('http://test/notifications', 'PATCH', undefined, token),
    )
    expect(readAllResponse.status).toBe(200)
    const readAllJson = await readAllResponse.json()
    expect(readAllJson.result).toBe(true)
    expect(typeof readAllJson.updated).toBe('number')

    // 이후 unread 필터는 비어야 한다.
    const unreadResponse = await notificationsRoute.GET(
      jsonRequest('http://test/notifications?filter=unread', 'GET', undefined, token),
    )
    expect((await unreadResponse.json()).data).toHaveLength(0)
  })

  it('tax-schedules: 2026-06 월 조회는 시드된 세무 일정을 읽기전용 EventDto로 반환한다', async () => {
    const response = await taxRoute.GET(
      jsonRequest('http://test/tax-schedules?year=2026&month=6', 'GET', undefined, token),
    )
    expect(response.status).toBe(200)
    const list = (await response.json()).data
    expect(list.length).toBeGreaterThanOrEqual(1)
    expect(list[0].source).toBe('tax')
    expect(list[0].editable).toBe(false)
    expect(list[0].id).toMatch(/^t\d+$/)
  })

  it('admin/members: 더미 목록을 반환하고 q 필터가 동작한다', async () => {
    const allResponse = await membersRoute.GET(
      jsonRequest('http://test/admin/members', 'GET', undefined, token),
    )
    expect(allResponse.status).toBe(200)
    const all = (await allResponse.json()).data
    expect(all.length).toBeGreaterThan(0)

    const filteredResponse = await membersRoute.GET(
      jsonRequest('http://test/admin/members?q=김도윤', 'GET', undefined, token),
    )
    const filtered = (await filteredResponse.json()).data
    expect(filtered.length).toBe(1)
    expect(filtered[0].name).toBe('김도윤')
  })
})
