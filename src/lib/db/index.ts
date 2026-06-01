/**
 * Dexie(IndexedDB) 데이터베이스 인스턴스
 * ---------------------------------------------------------------------------
 * schema.ts의 SCHEMA_VERSIONS를 읽어 Dexie 인스턴스를 구성한다.
 * 스토어(테이블)가 정의되면 `db.table('name')` 또는 클래스 필드로 접근한다.
 *
 * IndexedDB는 브라우저 전용이므로 이 모듈은 클라이언트(use client)에서만 사용한다.
 */

import Dexie from 'dexie'
import { DB_NAME, SCHEMA_VERSIONS } from './schema'

export class AppDB extends Dexie {
  // TODO: 스토어 확정 시 테이블 핸들을 선언한다.
  // 예: taxSchedules!: Dexie.Table<TaxSchedule, number>

  constructor() {
    super(DB_NAME)

    for (const schema of SCHEMA_VERSIONS) {
      const versionBuilder = this.version(schema.version).stores(schema.stores)
      if (schema.upgrade) {
        versionBuilder.upgrade(schema.upgrade as never)
      }
    }
  }
}

/** 앱 전역에서 공유하는 단일 DB 인스턴스 */
export const db = new AppDB()
