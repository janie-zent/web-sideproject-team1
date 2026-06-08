// 보호 경로 인증 게이팅 (Edge 런타임)
// ⚠️ Edge는 Node crypto 미지원 → jsonwebtoken 서명 검증 불가.
//    여기서는 Authorization: Bearer <토큰> 의 "존재/형식"만 확인한다.
//    실제 서명 검증은 각 Node route의 requireAuth()가 수행한다.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 로그인 경로는 인증 불필요 — 게이팅 제외
  if (pathname === '/api/v1/admin/users/login') {
    return NextResponse.next()
  }

  const header = request.headers.get('authorization') ?? ''
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) {
    return NextResponse.json(
      { result: false, message: '인증 토큰이 필요합니다' },
      { status: 401 },
    )
  }

  return NextResponse.next()
}

export const config = {
  // 컬렉션 경로(/users)와 하위 경로(/users/...) 모두 보호한다. (login 제외는 위 코드에서 분기)
  matcher: ['/api/v1/admin/users', '/api/v1/admin/users/:path*'],
}
