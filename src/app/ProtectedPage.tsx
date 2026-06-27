'use client'

import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

export function ProtectedPage({ children }: { children: ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  return <>{children}</>
}
