'use client'

import { ReactNode } from 'react'

export function ProtectedPage({ children }: { children: ReactNode }) {
  // 인증은 미들웨어에서 처리됨 (HttpOnly 쿠키 확인)
  // 이 컴포넌트는 단순히 레이아웃 래퍼 역할
  return <>{children}</>
}
