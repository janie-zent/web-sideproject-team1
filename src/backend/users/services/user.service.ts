// 사용자 비즈니스 로직 계층 (service)
// repository + shared(jwt/password/errors)만 import 한다. prisma 직접 호출 금지.
import * as userRepository from '../repositories/user.repository'
import { hashPassword, comparePassword } from '../../shared/password'
import { signToken } from '../../shared/jwt'
import { AppError } from '../../shared/errors'
import type {
  User,
  UserDto,
  LoginInput,
  CreateUserInput,
  UpdateUserInput,
  JwtPayload,
} from '../user.types'

// 내부 엔티티(User)를 응답용 DTO로 변환한다. password를 제거하는 단일 지점.
function toDto(user: User): UserDto {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  }
}

// 로그인: 자격 검증 후 토큰 발급
export async function login(input: LoginInput): Promise<string> {
  const user = await userRepository.findByUsername(input.username)
  if (!user) {
    throw new AppError('INVALID_CREDENTIALS', 401, '아이디 또는 비밀번호가 올바르지 않습니다')
  }
  const matched = await comparePassword(input.password, user.password)
  if (!matched) {
    throw new AppError('INVALID_CREDENTIALS', 401, '아이디 또는 비밀번호가 올바르지 않습니다')
  }
  const payload: JwtPayload = { sub: user.id, username: user.username }
  return signToken(payload)
}

// 내 정보 조회 (토큰 payload의 sub 기준)
export async function getMe(userId: number): Promise<UserDto> {
  const user = await userRepository.findById(userId)
  if (!user) {
    throw new AppError('USER_NOT_FOUND', 404, '사용자를 찾을 수 없습니다')
  }
  return toDto(user)
}

// 사용자 목록
export async function listUsers(): Promise<UserDto[]> {
  const users = await userRepository.findAll()
  return users.map(toDto)
}

// 사용자 단건 조회
export async function getUser(id: number): Promise<UserDto> {
  const user = await userRepository.findById(id)
  if (!user) {
    throw new AppError('USER_NOT_FOUND', 404, '사용자를 찾을 수 없습니다')
  }
  return toDto(user)
}

// 사용자 생성 (username 중복 검사 + 비밀번호 해시)
export async function createUser(input: CreateUserInput): Promise<UserDto> {
  const existing = await userRepository.findByUsername(input.username)
  if (existing) {
    throw new AppError('USERNAME_TAKEN', 409, '이미 사용 중인 아이디입니다')
  }
  const hashed = await hashPassword(input.password)
  const created = await userRepository.create({
    username: input.username,
    password: hashed,
    name: input.name ?? null,
  })
  return toDto(created)
}

// 사용자 수정 (전달된 필드만, password는 해시)
export async function updateUser(id: number, input: UpdateUserInput): Promise<UserDto> {
  const existing = await userRepository.findById(id)
  if (!existing) {
    throw new AppError('USER_NOT_FOUND', 404, '사용자를 찾을 수 없습니다')
  }
  const data: { name?: string | null; password?: string } = {}
  if (input.name !== undefined) {
    data.name = input.name
  }
  if (input.password !== undefined) {
    data.password = await hashPassword(input.password)
  }
  const updated = await userRepository.update(id, data)
  return toDto(updated)
}

// 사용자 삭제
export async function deleteUser(id: number): Promise<void> {
  const existing = await userRepository.findById(id)
  if (!existing) {
    throw new AppError('USER_NOT_FOUND', 404, '사용자를 찾을 수 없습니다')
  }
  await userRepository.remove(id)
}
