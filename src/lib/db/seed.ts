/**
 * 초기 데이터 시드 스크립트
 * ---------------------------------------------------------------------------
 * IndexedDB는 브라우저에서만 동작하므로, 이 시드는 Node가 아니라
 * 클라이언트 첫 로드 시점(예: 앱 진입 시 useEffect)에 한 번 호출한다.
 *
 * 사용 예:
 *   import { seedIfEmpty } from '@/lib/db/seed'
 *   useEffect(() => { seedIfEmpty() }, [])
 *
 * ⚠️ 아직 실제 시드 데이터는 비어있는 "껍데기" 상태다.
 *    schema.ts에 스토어가 정의되면 아래 INITIAL_DATA와 삽입 로직을 채운다.
 */

import { db } from './index'

/** 시드 완료 여부를 기록하는 localStorage 키 (중복 삽입 방지) */
const SEED_FLAG_KEY = 'side-project:seeded'

/* ---------------------------------------------------------------------------
 * 초기 데이터 정의 — 스토어 확정 후 채운다.
 * 예시(설계 확정 후 주석 해제·수정):
 * -------------------------------------------------------------------------*/
// const INITIAL_TAX_TYPES = [
//   { code: 'VAT',     name: '부가가치세' },
//   { code: 'INCOME',  name: '종합소득세' },
//   { code: 'CORP',    name: '법인세' },
//   { code: 'WITHHOLD', name: '원천세' },
// ]

/**
 * 비어있을 때만 초기 데이터를 삽입한다. 이미 시드되었으면 아무것도 하지 않는다.
 */
export async function seedIfEmpty(): Promise<void> {
  if (typeof window === 'undefined') return
  if (window.localStorage.getItem(SEED_FLAG_KEY) === 'done') return

  // 스토어가 아직 정의되지 않은 껍데기 상태에서는 삽입할 것이 없다.
  if (db.tables.length === 0) return

  // TODO: 스토어가 정의되면 아래처럼 트랜잭션 안에서 초기 데이터를 삽입한다.
  // await db.transaction('rw', db.taxTypes, async () => {
  //   await db.taxTypes.bulkPut(INITIAL_TAX_TYPES)
  // })

  window.localStorage.setItem(SEED_FLAG_KEY, 'done')
}

/**
 * 모든 데이터를 지우고 시드 플래그를 초기화한다. (개발/리셋용)
 */
export async function resetAndReseed(): Promise<void> {
  if (typeof window === 'undefined') return
  await db.delete()
  window.localStorage.removeItem(SEED_FLAG_KEY)
  await db.open()
  await seedIfEmpty()
}
