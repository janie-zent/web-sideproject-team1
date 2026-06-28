// POST /api/v1/admin/users/logout — 로그아웃
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST() {
  const response = NextResponse.json({ success: true })

  // HttpOnly 쿠키 삭제
  response.cookies.delete('auth_token')

  return response
}
