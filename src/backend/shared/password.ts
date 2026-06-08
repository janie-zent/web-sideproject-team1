// 비밀번호 해시/비교 (bcryptjs — 순수 JS, 네이티브 빌드 불필요)
import bcrypt from 'bcryptjs'

// bcrypt salt rounds (비용 인자)
const SALT_ROUNDS = 10

// 평문 비밀번호를 해시한다.
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

// 평문과 해시를 비교한다. 일치하면 true.
export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}
