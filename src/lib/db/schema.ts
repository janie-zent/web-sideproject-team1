/**
 * IndexedDB 스키마 정의 (DDL)
 * ---------------------------------------------------------------------------
 * Dexie는 `version(n).stores({...})` 형태로 오브젝트 스토어(=테이블)와
 * 인덱스를 선언한다. 이 파일이 곧 "DDL"이며, 스키마를 바꿀 때는
 * 새 버전을 추가하고 필요 시 upgrade() 콜백으로 마이그레이션한다.
 *
 * stores 문자열 문법:
 *   '++id'        자동 증가 기본키
 *   'id'          직접 지정 기본키
 *   '&field'      유니크 인덱스
 *   'field'       일반 인덱스
 *   '[a+b]'       복합 인덱스
 *   '*tags'       멀티엔트리 인덱스(배열 필드)
 *
 * ⚠️ 아직 실제 테이블은 정의하지 않은 "껍데기" 상태다.
 *    세무일정 도메인 모델이 확정되면 아래 SCHEMA_VERSIONS와 엔티티 타입을 채운다.
 */

export const DB_NAME = 'side-project-db'

/** 스토어(테이블) 정의. 키는 스토어명, 값은 Dexie stores 문자열. */
export type StoreMap = Record<string, string>

/** 버전별 스키마 정의. 새 스키마 변경 시 version을 올려 항목을 추가한다. */
export interface SchemaVersion {
  version: number
  stores: StoreMap
  /** 이전 버전 데이터 마이그레이션이 필요할 때 사용 (선택) */
  upgrade?: (tx: unknown) => void | Promise<void>
}

export const SCHEMA_VERSIONS: SchemaVersion[] = [
  {
    version: 1,
    // TODO: 세무일정 도메인이 확정되면 스토어를 정의한다.
    // 예시(설계 확정 후 주석 해제·수정):
    // stores: {
    //   taxSchedules: '++id, title, dueDate, taxType, status, *tags',
    //   taxTypes:     '&code, name',
    //   reminders:    '++id, scheduleId, remindAt, sent',
    // },
    stores: {},
  },
]

/* ---------------------------------------------------------------------------
 * 엔티티 타입 (TypeScript)
 * 스토어 1개당 인터페이스 1개를 대응시킨다. 아래는 설계 예시 — 확정 시 채운다.
 * -------------------------------------------------------------------------*/

// export interface TaxSchedule {
//   id?: number
//   title: string
//   taxType: string      // taxTypes.code 참조
//   dueDate: string      // ISO yyyy-mm-dd
//   status: 'todo' | 'done'
//   tags?: string[]
//   memo?: string
//   createdAt: string
// }

// export interface TaxType {
//   code: string
//   name: string
// }

// export interface Reminder {
//   id?: number
//   scheduleId: number
//   remindAt: string
//   sent: boolean
// }
