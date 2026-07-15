'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react' 

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // 인증은 미들웨어에서 처리됨
    // 이 페이지에 도달한 사용자는 이미 인증됨
    router.push('/calendar')
  }, [router])

  return null
}
