// settings.service 단위 테스트
// settings.repository를 mock하여 부분 업데이트/기본값 폴백 로직을 검증한다.
import { describe, it, expect, beforeEach, vi } from 'vitest'

// repository 계층 전체를 mock으로 대체한다.
vi.mock('../repositories/settings.repository', () => ({
  findSingleton: vi.fn(),
  upsertSingleton: vi.fn(),
}))

import * as settingsRepository from '../repositories/settings.repository'
import * as settingsService from '../services/settings.service'
import type { Settings } from '../settings.types'

const mockedRepo = vi.mocked(settingsRepository)

// 테스트용 Settings 엔티티 팩토리
function buildSettings(overrides: Partial<Settings> = {}): Settings {
  return {
    id: 1,
    pushEnabled: true,
    emailEnabled: true,
    kakaoEnabled: false,
    smsEnabled: false,
    taxAutoNotify: true,
    defaultRemind: '3d',
    showTax: true,
    weekStart: 0,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getSettings', () => {
  it('행이 있으면 해당 설정을 반환한다', async () => {
    mockedRepo.findSingleton.mockResolvedValue(buildSettings({ pushEnabled: false }))
    const dto = await settingsService.getSettings()
    expect(dto.pushEnabled).toBe(false)
  })

  it('행이 없으면 기본값(폴백)을 반환한다', async () => {
    mockedRepo.findSingleton.mockResolvedValue(null)
    const dto = await settingsService.getSettings()
    expect(dto).toEqual({
      id: 1,
      pushEnabled: true,
      emailEnabled: true,
      kakaoEnabled: false,
      smsEnabled: false,
      taxAutoNotify: true,
      defaultRemind: '3d',
      showTax: true,
      weekStart: 0,
    })
  })
})

describe('updateSettings (부분 업데이트)', () => {
  it('전달된 필드만 upsert 데이터에 포함한다 (undefined 필드 제외)', async () => {
    mockedRepo.upsertSingleton.mockImplementation(async (data) => buildSettings({ ...data }))

    await settingsService.updateSettings({ kakaoEnabled: true, defaultRemind: '1w' })

    const upsertArg = mockedRepo.upsertSingleton.mock.calls[0][0]
    expect(upsertArg).toEqual({ kakaoEnabled: true, defaultRemind: '1w' })
    // 전달하지 않은 필드는 포함되면 안 된다.
    expect(upsertArg).not.toHaveProperty('pushEnabled')
    expect(upsertArg).not.toHaveProperty('weekStart')
  })

  it('false/0 같은 falsy 값도 누락하지 않고 포함한다 (undefined만 제외)', async () => {
    mockedRepo.upsertSingleton.mockImplementation(async (data) => buildSettings({ ...data }))

    await settingsService.updateSettings({ pushEnabled: false, weekStart: 0 })

    const upsertArg = mockedRepo.upsertSingleton.mock.calls[0][0]
    expect(upsertArg).toEqual({ pushEnabled: false, weekStart: 0 })
  })

  it('갱신 결과 전체 설정 DTO를 반환한다', async () => {
    mockedRepo.upsertSingleton.mockResolvedValue(buildSettings({ smsEnabled: true }))
    const dto = await settingsService.updateSettings({ smsEnabled: true })
    expect(dto.smsEnabled).toBe(true)
    expect(dto.id).toBe(1)
  })

  it('빈 입력이면 빈 데이터로 upsert를 호출한다', async () => {
    mockedRepo.upsertSingleton.mockResolvedValue(buildSettings())
    await settingsService.updateSettings({})
    expect(mockedRepo.upsertSingleton).toHaveBeenCalledWith({})
  })
})
