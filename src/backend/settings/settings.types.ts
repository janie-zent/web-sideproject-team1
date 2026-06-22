// 설정 도메인 타입 단일 출처. (단일 행 — 1인 사용자)

// 내부 엔티티 (Prisma Settings 1:1). DTO와 형태가 동일하므로 별도 변환은 불필요하지만
// 일관성을 위해 service에서 toDto()를 통과시킨다.
export interface Settings {
  id: number
  pushEnabled: boolean
  emailEnabled: boolean
  kakaoEnabled: boolean
  smsEnabled: boolean
  taxAutoNotify: boolean
  defaultRemind: string // "same"|"1d"|"3d"|"1w"
  showTax: boolean
  weekStart: number // 0=일,1=월
}

// 응답 DTO (Settings와 동일 형태)
export type SettingsDto = Settings

// 부분 업데이트 입력 (전달된 필드만 반영, id 변경 불가)
export interface UpdateSettingsInput {
  pushEnabled?: boolean
  emailEnabled?: boolean
  kakaoEnabled?: boolean
  smsEnabled?: boolean
  taxAutoNotify?: boolean
  defaultRemind?: string
  showTax?: boolean
  weekStart?: number
}
