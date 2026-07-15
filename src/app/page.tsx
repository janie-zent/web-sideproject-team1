'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '올챙이 — 캘린더',
  description: '세무 + 개인 일정을 한눈에 보는 월간 캘린더',
}


export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // 인증은 미들웨어에서 처리됨
    // 이 페이지에 도달한 사용자는 이미 인증됨
    router.push('/calendar')
  }, [router])

  return null
}
