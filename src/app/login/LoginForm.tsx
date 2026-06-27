'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [autoLogin, setAutoLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/v1/admin/users/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || '로그인에 실패했습니다')
      }

      const data = await response.json()
      localStorage.setItem('token', data.token)

      if (autoLogin) {
        localStorage.setItem('email', email)
      }

      router.push('/')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <header className="login-header">
          <div className="traffic">
            <i className="r" />
            <i className="y" />
            <i className="g" />
          </div>
        </header>

        <div className="login-content">
          <div className="login-left">
            <div>
              <div className="logo-section">
                <img
                  src="/olchaengi-logo.png"
                  alt="올챙이"
                  className="logo-image"
                  width="32"
                  height="32"
                />
                <span className="logo-text">올챙이</span>
              </div>

              <h1 className="tagline">농치기 쉬운 세무 일정,<br />올챙이가 챙겨드려요.</h1>

              <p className="description">
                매달 돌아오는 신고 기한, 이제 외우지 않아도 돼요. 회원님
                께 필요한 세무 일정만 골라 제때 알림으로 챙겨드립니다.
              </p>
            </div>

            <div className="stats">
              <div className="stat">
                <div className="stat-value">12,840</div>
                <div className="stat-label">등록 사업자</div>
              </div>
              <div className="stat">
                <div className="stat-value">98%</div>
                <div className="stat-label">기한 내 신고율</div>
              </div>
              <div className="stat">
                <div className="stat-value">24h</div>
                <div className="stat-label">사건 알림</div>
              </div>
            </div>
          </div>

          <div className="login-right">
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  아이디 (이메일)
                </label>
                <input
                  className="form-input"
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  비밀번호
                </label>
                <input
                  className="form-input"
                  id="password"
                  type="password"
                  placeholder="•••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {error && <div className="form-error">{error}</div>}

              <div className="form-footer">
                <label className="login-checkbox">
                  <input
                    type="checkbox"
                    checked={autoLogin}
                    onChange={(e) => setAutoLogin(e.target.checked)}
                    disabled={loading}
                  />
                  자동 로그인
                </label>
                <a href="#" className="form-link">
                  비밀번호 찾기
                </a>
              </div>

              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="loading" />
                    로그인 중...
                  </>
                ) : (
                  '로그인'
                )}
              </button>

              <p className="signup-prompt">
                아직 회원이 아니신가요?{' '}
                <a href="#" className="signup-link">
                  회원가입
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
