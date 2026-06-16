// GET /api/v1/admin/members?q= — 회원 목록/검색 (더미)
import * as adminService from '@/backend/admin/services/admin.service'
import { ok, handleError, requireAuth } from '@/backend/shared/http'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    requireAuth(request)
    const query = new URL(request.url).searchParams.get('q') ?? ''
    const data = adminService.listMembers(query)
    return ok({ data })
  } catch (error) {
    return handleError(error)
  }
}
