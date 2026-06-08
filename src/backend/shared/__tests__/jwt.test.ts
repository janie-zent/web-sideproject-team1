// jwt 유닛 테스트: sign→verify 라운드트립, 위조/형식오류 토큰 verify 실패
import { describe, it, expect, beforeAll } from 'vitest'
import jwt from 'jsonwebtoken'
import { signToken, verifyToken } from '../jwt'
import { AppError } from '../errors'
import type { JwtPayload } from '../../users/user.types'

// jwt 모듈은 import 시점이 아니라 호출 시점에 JWT_SECRET을 읽으므로
// 테스트 시작 전에만 보장되면 된다.
beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret'
})

describe('signToken / verifyToken', () => {
  const payload: JwtPayload = { sub: 42, username: 'admin' }

  it('sign 후 verify 하면 동일한 payload(sub/username)를 돌려준다', () => {
    const token = signToken(payload)
    const decoded = verifyToken(token)
    expect(decoded.sub).toBe(42)
    expect(decoded.username).toBe('admin')
  })

  it('다른 비밀키로 서명된 위조 토큰은 401 AppError로 실패한다', () => {
    const forged = jwt.sign(payload, 'wrong-secret', { algorithm: 'HS256' })
    expect(() => verifyToken(forged)).toThrowError(AppError)
    try {
      verifyToken(forged)
    } catch (error) {
      expect((error as AppError).status).toBe(401)
      expect((error as AppError).code).toBe('INVALID_TOKEN')
    }
  })

  it('형식이 깨진 문자열 토큰은 401 AppError로 실패한다', () => {
    expect(() => verifyToken('not-a-real-token')).toThrowError(AppError)
  })

  it('sub가 number가 아닌 payload로 서명된 토큰은 INVALID_TOKEN으로 거부된다', () => {
    // sub를 문자열로 넣어 verifyToken의 타입 가드를 검증한다.
    const badToken = jwt.sign({ sub: 'notnumber', username: 'x' }, 'test-secret', {
      algorithm: 'HS256',
    })
    try {
      verifyToken(badToken)
      throw new Error('여기 도달하면 안 된다')
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).code).toBe('INVALID_TOKEN')
    }
  })
})
