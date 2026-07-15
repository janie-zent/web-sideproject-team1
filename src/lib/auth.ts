// HttpOnly 쿠키 기반 인증
// 쿠키는 JavaScript에서 읽을 수 없으므로 서버에서 확인됨

const EMAIL_KEY = 'stored_email'

export function getStoredEmail(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(EMAIL_KEY)
}

export function setStoredEmail(email: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(EMAIL_KEY, email)
  }
}

export function clearStoredEmail(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(EMAIL_KEY)
  }
}
