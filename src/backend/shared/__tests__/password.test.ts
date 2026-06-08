// password 유닛 테스트: hash 후 compare true, 틀린 비번 false
import { describe, it, expect } from 'vitest'
import { hashPassword, comparePassword } from '../password'

describe('hashPassword / comparePassword', () => {
  it('해시한 비밀번호는 평문과 다르다', async () => {
    const hashed = await hashPassword('1234')
    expect(hashed).not.toBe('1234')
    // bcrypt 해시 형식($2a$ 또는 $2b$로 시작)
    expect(hashed).toMatch(/^\$2[aby]\$/)
  })

  it('올바른 평문은 해시와 compare 시 true', async () => {
    const hashed = await hashPassword('1234')
    await expect(comparePassword('1234', hashed)).resolves.toBe(true)
  })

  it('틀린 평문은 해시와 compare 시 false', async () => {
    const hashed = await hashPassword('1234')
    await expect(comparePassword('wrong', hashed)).resolves.toBe(false)
  })
})
