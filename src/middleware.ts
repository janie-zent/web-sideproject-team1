// 인증 게이팅 (Edge 런타임)
// ⚠️ Edge는 Node crypto 미지원 → JWT 서명 검증 불가.
//    쿠키/헤더의 "존재"만 확인한다. 실제 검증은 Node routes에서 수행.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 로그인 페이지는 인증 불필요
  if (pathname === '/login') {
    return NextResponse.next()
  }

  // 공개 경로 (API 제외)
  if (pathname.startsWith('/api/v1/admin/users/login')) {
    return NextResponse.next()
  }

  // 토큰 확인: 쿠키 또는 Authorization 헤더
  const cookieToken = request.cookies.get('auth_token')?.value
  const headerToken = (() => {
    const header = request.headers.get('authorization') ?? ''
    const [scheme, token] = header.split(' ')
    return scheme === 'Bearer' ? token : null
  })()

  const token = cookieToken || headerToken

  if (!token) {
    // API 요청이면 JSON 응답
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: '인증 토큰이 필요합니다' },
        { status: 401 },
      )
    }

    // 페이지 요청이면 로그인으로 리다이렉트
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // 프론트엔드 보호 경로
    '/',
    '/calendar/:path*',
    // API 보호 경로
    '/api/v1/admin/users/:path*',
  ],
}
