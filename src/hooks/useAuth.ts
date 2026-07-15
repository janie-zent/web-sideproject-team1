import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { setStoredEmail, getStoredEmail, clearStoredEmail } from '@/lib/auth'
import { apiPost, ApiError } from '@/lib/api'

interface LoginInput {
  username: string
  password: string
}

interface LoginResponse {
  success: boolean
}

export function useAuth() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(
    async (credentials: LoginInput, rememberMe: boolean = false) => {
      setError(null)
      setLoading(true)

      try {
        // 로그인 요청 (응답에 HttpOnly 쿠키가 설정됨)
        await apiPost<LoginResponse>('/api/v1/admin/users/login', credentials)

        if (rememberMe) {
          setStoredEmail(credentials.username)
        }

        // 쿠키가 자동으로 설정되므로 리다이렉트
        router.push('/')
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : '로그인 중 오류가 발생했습니다'
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [router],
  )

  const logout = useCallback(async () => {
    try {
      // 백엔드에서 쿠키 제거
      await apiPost('/api/v1/admin/users/logout', {})
    } catch {
      // 로그아웃 실패해도 계속 진행
    } finally {
      clearStoredEmail()
      router.push('/login')
    }
  }, [router])

  const getStoredUser = useCallback((): string | null => {
    return getStoredEmail()
  }, [])

  return {
    login,
    logout,
    getStoredUser,
    loading,
    error,
  }
}
