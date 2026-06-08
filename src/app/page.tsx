import styles from './page.module.css'
import NotifyButton from './NotifyButton'

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>세무일정관리</h1>
      <p className={styles.subtitle}>
        Next.js(App Router) + IndexedDB(Dexie) 풀스택 사이드 프로젝트
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>데스크톱 기능 데모</h2>
        <NotifyButton />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>초기 세팅 완료 항목</h2>
        <ul className={styles.list}>
          <li>
            <span className={styles.badge}>FE</span> Next.js 14 App Router 스캐폴드
          </li>
          <li>
            <span className={styles.badge}>BE</span> Dexie 기반 IndexedDB 데이터 계층 (껍데기)
          </li>
          <li>
            <span className={styles.badge}>DB</span> 스키마(DDL) / 시드 스크립트 자리 마련
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>다음 단계</h2>
        <ul className={styles.list}>
          <li>세무일정 도메인 모델 정의 → src/lib/db/schema.ts</li>
          <li>초기 데이터 정의 → src/lib/db/seed.ts</li>
          <li>일정 목록/등록 화면 구현</li>
        </ul>
      </section>
    </main>
  )
}
