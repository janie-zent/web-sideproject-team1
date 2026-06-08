// Vitest 설정 — 서버 사이드 API 계층(Node 런타임) 단위 테스트용
// 브라우저 IndexedDB(Dexie) 계층과는 무관하므로 jsdom/fake-indexeddb 불필요.
import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: false,
  },
  resolve: {
    // tsconfig의 "@/*": ["./src/*"] 경로 별칭과 동일하게 맞춘다.
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
