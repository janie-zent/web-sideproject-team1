// 시드: admin / 1234 사용자 (비밀번호는 bcrypt 해시로 저장)
// 실행: pnpm db:seed (tsx prisma/seed.ts)
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const username = 'admin'
  const plainPassword = '1234'
  const hashed = await bcrypt.hash(plainPassword, 10)

  // 이미 있으면 비밀번호만 갱신, 없으면 생성 (멱등)
  await prisma.user.upsert({
    where: { username },
    update: { password: hashed },
    create: { username, password: hashed, name: '관리자' },
  })

  console.log(`시드 완료: ${username} 사용자 생성/갱신`)
}

main()
  .catch((error) => {
    console.error('시드 실패:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
