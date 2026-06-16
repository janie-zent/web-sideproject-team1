// 인증 비즈니스 로직 계층 (service)
// repository + shared(jwt/password/errors)만 import 한다. prisma 직접 호출 금지.
import * as accountRepository from '../repositories/account.repository'
import { comparePassword } from '../../shared/password'
import { signToken } from '../../shared/jwt'
import { AppError } from '../../shared/errors'
import type { Account, AccountDto, LoginInput } from '../auth.types'
import type { JwtPayload } from '../../users/user.types'

// 내부 엔티티(Account)를 응답용 DTO로 변환한다. password를 제거하는 단일 지점.
function toDto(account: Account): AccountDto {
  return {
    id: account.id,
    email: account.email,
    name: account.name,
    bizName: account.bizName,
    bizNo: account.bizNo,
    plan: account.plan,
    createdAt: account.createdAt.toISOString(),
  }
}

// 로그인: 자격 검증 후 토큰 발급
// JwtPayload.username 필드에 email을 담아 기존 jwt 유틸을 그대로 재사용한다.
export async function login(input: LoginInput): Promise<string> {
  const account = await accountRepository.findByEmail(input.email)
  if (!account) {
    throw new AppError('INVALID_CREDENTIALS', 401, '이메일 또는 비밀번호가 올바르지 않습니다')
  }
  const matched = await comparePassword(input.password, account.password)
  if (!matched) {
    throw new AppError('INVALID_CREDENTIALS', 401, '이메일 또는 비밀번호가 올바르지 않습니다')
  }
  const payload: JwtPayload = { sub: account.id, username: account.email }
  return signToken(payload)
}

// 내 계정 정보 조회 (토큰 payload의 sub 기준)
export async function getMe(accountId: number): Promise<AccountDto> {
  const account = await accountRepository.findById(accountId)
  if (!account) {
    throw new AppError('ACCOUNT_NOT_FOUND', 404, '계정을 찾을 수 없습니다')
  }
  return toDto(account)
}
