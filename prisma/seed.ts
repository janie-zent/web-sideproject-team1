// 시드: 기존 admin 사용자 + 올챙이 단일 계정/설정/알림/세무일정/개인일정
// 비밀번호는 bcrypt 해시로 저장. 모든 항목은 멱등(upsert/존재 시 스킵)하게 작성한다.
// 실행: pnpm db:seed (tsx prisma/seed.ts)
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// 기존 User(admin/1234) 시드 — 보존
async function seedUser() {
  const username = 'admin'
  const hashed = await bcrypt.hash('1234', 10)
  await prisma.user.upsert({
    where: { username },
    update: { password: hashed },
    create: { username, password: hashed, name: '관리자' },
  })
  console.log(`시드 완료: User ${username}`)
}

// 올챙이 단일 계정 (1인 사용자) — user@olchaengi.app / 1234
async function seedAccount() {
  const email = 'user@olchaengi.app'
  const hashed = await bcrypt.hash('1234', 10)
  await prisma.account.upsert({
    where: { email },
    update: { password: hashed },
    create: {
      email,
      password: hashed,
      name: '김도윤',
      bizName: '도윤상사',
      bizNo: '124-81-00567',
      plan: 'pro',
    },
  })
  console.log(`시드 완료: Account ${email}`)
}

// 회원 설정 단일 행 (id=1)
async function seedSettings() {
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  })
  console.log('시드 완료: Settings(기본값 1행)')
}

// 알림 (data.jsx NOTIFS) — 멱등 보장을 위해 비어있을 때만 투입
const NOTIFS = [
  { cat: 'with', title: '5월분 원천세 신고가 4일 남았습니다', body: '6월 10일까지 5월분 원천세를 신고·납부하세요.', when: '오늘 09:00', unread: true },
  { cat: 'insure', title: '4대보험료 납부 안내', body: '5월분 4대보험료 납부 마감이 다가옵니다.', when: '오늘 09:00', unread: true },
  { cat: 'vat', title: '부가세 예정고지서가 발송되었습니다', body: '홈택스에서 1기 예정고지 세액을 확인하세요.', when: '어제 16:20', unread: true },
  { cat: 'personal', title: '세무사 정기 상담 D-1', body: '내일 14:00 강남 세무회계 사무실 방문 예정.', when: '어제 08:00', unread: false },
  { cat: 'income', title: '종합소득세 신고기한 안내', body: '성실신고확인대상자 신고기한은 6월 30일입니다.', when: '6월 9일', unread: false },
  { cat: 'with', title: '일용근로 지급명세서 제출 완료', body: '5월분 지급명세서가 정상 접수되었습니다.', when: '6월 2일', unread: false },
]

async function seedNotifications() {
  const existing = await prisma.notification.count()
  if (existing > 0) {
    console.log(`스킵: Notification 이미 ${existing}건 존재`)
    return
  }
  // 최신순(목록 상단)이 먼저 보이도록 createdAt을 역순으로 부여한다.
  const baseTime = Date.now()
  await prisma.notification.createMany({
    data: NOTIFS.map((notif, index) => ({
      ...notif,
      createdAt: new Date(baseTime - index * 60_000),
    })),
  })
  console.log(`시드 완료: Notification ${NOTIFS.length}건`)
}

// 세무 일정 마스터 (data.jsx TAX_MASTER)
// startDate는 2026년 6월 캘린더 표시용으로 period에서 도출한다.
// "매월 10일" → 2026-06-10, "YYYY.MM.DD" → ISO 변환. 도출 불가 시 null.
const TAX_MASTER = [
  { cat: 'with', title: '원천세 신고·납부', period: '매월 10일', source: 'api', cycle: '매월', updated: '2026.06.01', startDate: '2026-06-10' },
  { cat: 'vat', title: '1기 부가가치세 예정고지', period: '2026.06.25', source: 'api', cycle: '분기', updated: '2026.06.01', startDate: '2026-06-25' },
  { cat: 'income', title: '종합소득세 확정신고', period: '2026.05.31', source: 'api', cycle: '연 1회', updated: '2026.05.01', startDate: '2026-05-31' },
  { cat: 'income', title: '성실신고확인대상자 종소세', period: '2026.06.30', source: 'api', cycle: '연 1회', updated: '2026.05.01', startDate: '2026-06-30' },
  { cat: 'corp', title: '3월 결산법인 법인세 신고', period: '2026.06.30', source: 'manual', cycle: '연 1회', updated: '2026.06.03', startDate: '2026-06-30' },
  { cat: 'insure', title: '4대보험료 납부', period: '매월 10일', source: 'api', cycle: '매월', updated: '2026.06.01', startDate: '2026-06-10' },
  { cat: 'vat', title: '1기 부가가치세 확정신고', period: '2026.07.25', source: 'api', cycle: '분기', updated: '2026.06.10', startDate: '2026-07-25' },
  { cat: 'insure', title: '지방소득세 특별징수분 납부', period: '매월 10일', source: 'manual', cycle: '매월', updated: '2026.06.02', startDate: '2026-06-10' },
]

async function seedTaxSchedules() {
  const existing = await prisma.taxSchedule.count()
  if (existing > 0) {
    console.log(`스킵: TaxSchedule 이미 ${existing}건 존재`)
    return
  }
  await prisma.taxSchedule.createMany({
    data: TAX_MASTER.map((tax) => ({ ...tax, endDate: null })),
  })
  console.log(`시드 완료: TaxSchedule ${TAX_MASTER.length}건`)
}

// 개인 일정 (data.jsx EVENTS 중 cat='personal') — 2026년 6월
const PERSONAL_EVENTS = [
  { title: '거래처 입금 확인', startDate: '2026-06-10', time: '11:00', allday: false, memo: '도윤상사 매출 대금 입금 확인.' },
  { title: '급여 이체', startDate: '2026-06-10', time: '14:00', allday: false, memo: '직원 급여 및 4대보험 이체.' },
  { title: '세무사 정기 상담', startDate: '2026-06-11', time: '14:00', allday: false, memo: '6월 결산 관련 정기 상담. 강남 세무회계 사무실.' },
  { title: '가족 모임', startDate: '2026-06-14', time: '12:00', allday: false, memo: '부모님 생신 점심 식사.' },
  { title: '거래처 세금계산서 발행', startDate: '2026-06-16', time: '10:00', allday: false, memo: '6월 1차 매출분 전자세금계산서 발행 및 전송.' },
  { title: '분기 매출 정산', startDate: '2026-06-22', time: '15:00', allday: false, memo: '2분기 매출/매입 자료 정리 및 장부 마감.' },
  { title: '법인카드 결제일', startDate: '2026-06-25', time: null, allday: false, memo: '신한카드 법인 결제 예정.' },
  { title: '상반기 회고 정리', startDate: '2026-06-30', time: '18:00', allday: false, memo: '상반기 사업 결산 및 하반기 계획.' },
  { title: '부산 출장 (지점 세무 점검)', startDate: '2026-06-08', endDate: '2026-06-14', time: null, allday: true, memo: '부산 지점 장부·증빙 점검 및 거래처 미팅. 6월 8일~14일.' },
]

async function seedPersonalEvents() {
  const existing = await prisma.personalEvent.count()
  if (existing > 0) {
    console.log(`스킵: PersonalEvent 이미 ${existing}건 존재`)
    return
  }
  await prisma.personalEvent.createMany({
    data: PERSONAL_EVENTS.map((event) => ({
      cat: 'personal',
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate ?? null,
      time: event.time ?? null,
      allday: event.allday ?? false,
      memo: event.memo ?? null,
    })),
  })
  console.log(`시드 완료: PersonalEvent ${PERSONAL_EVENTS.length}건`)
}

async function main() {
  await seedUser()
  await seedAccount()
  await seedSettings()
  await seedNotifications()
  await seedTaxSchedules()
  await seedPersonalEvents()
  console.log('전체 시드 완료')
}

main()
  .catch((error) => {
    console.error('시드 실패:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
