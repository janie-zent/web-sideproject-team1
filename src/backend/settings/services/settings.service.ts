// 설정 비즈니스 로직 계층 (service)
// repository + shared만 import 한다. prisma 직접 호출 금지.
import * as settingsRepository from '../repositories/settings.repository'
import type { Settings, SettingsDto, UpdateSettingsInput } from '../settings.types'

// 기본 설정값 — 시드 누락 등으로 행이 없을 때 폴백으로 사용한다. (Prisma 기본값과 동일)
const DEFAULT_SETTINGS: Settings = {
  id: 1,
  pushEnabled: true,
  emailEnabled: true,
  kakaoEnabled: false,
  smsEnabled: false,
  taxAutoNotify: true,
  defaultRemind: '3d',
  showTax: true,
  weekStart: 0,
}

// 내부 엔티티를 응답 DTO로 변환한다. (형태 동일 — 단일 변환 지점 유지)
function toDto(settings: Settings): SettingsDto {
  return { ...settings }
}

// 설정 조회 — 행이 없으면 기본값을 반환한다.
export async function getSettings(): Promise<SettingsDto> {
  const settings = await settingsRepository.findSingleton()
  return toDto(settings ?? DEFAULT_SETTINGS)
}

// 설정 부분 업데이트 — 전달된 필드만 반영하고 갱신된 전체 설정을 반환한다.
export async function updateSettings(input: UpdateSettingsInput): Promise<SettingsDto> {
  // undefined가 아닌 필드만 추려 부분 업데이트 데이터를 만든다.
  const data: UpdateSettingsInput = {}
  const keys: (keyof UpdateSettingsInput)[] = [
    'pushEnabled',
    'emailEnabled',
    'kakaoEnabled',
    'smsEnabled',
    'taxAutoNotify',
    'defaultRemind',
    'showTax',
    'weekStart',
  ]
  for (const key of keys) {
    if (input[key] !== undefined) {
      ;(data as Record<string, unknown>)[key] = input[key]
    }
  }
  const updated = await settingsRepository.upsertSingleton(data)
  return toDto(updated)
}
