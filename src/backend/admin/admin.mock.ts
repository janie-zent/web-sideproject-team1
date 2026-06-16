// 관리자 더미 데이터셋 (DB 미반영)
// 디자인 목업 data.jsx의 MEMBERS / TAX_MASTER / SENT를 서버 상수로 이식한 것이다.
import type { MemberDto, AdminTaxScheduleDto, SentDto } from './admin.types'

// 관리자 — 회원 목록 (data.jsx MEMBERS)
export const MEMBERS: MemberDto[] = [
  { id: 'm1', name: '김도윤', biz: '도윤상사', bizno: '124-81-00567', type: '법인', plan: '프로', status: 'active', joined: '2025.03.12', last: '2시간 전' },
  { id: 'm2', name: '이서연', biz: '서연디자인', bizno: '220-11-45821', type: '개인', plan: '베이직', status: 'active', joined: '2025.05.02', last: '어제' },
  { id: 'm3', name: '박지호', biz: '지호테크', bizno: '113-86-77210', type: '법인', plan: '프로', status: 'active', joined: '2024.11.20', last: '5분 전' },
  { id: 'm4', name: '최유진', biz: '유진컴퍼니', bizno: '312-22-90183', type: '개인', plan: '베이직', status: 'dormant', joined: '2025.01.08', last: '32일 전' },
  { id: 'm5', name: '정민서', biz: '민서푸드', bizno: '405-19-33028', type: '개인', plan: '프로', status: 'active', joined: '2025.04.27', last: '1일 전' },
  { id: 'm6', name: '강하준', biz: '하준엔지니어링', bizno: '128-81-55409', type: '법인', plan: '엔터프라이즈', status: 'active', joined: '2024.07.15', last: '3시간 전' },
  { id: 'm7', name: '윤채원', biz: '채원스튜디오', bizno: '617-30-12876', type: '개인', plan: '베이직', status: 'paused', joined: '2025.02.19', last: '12일 전' },
  { id: 'm8', name: '임시우', biz: '시우물류', bizno: '514-85-66120', type: '법인', plan: '프로', status: 'active', joined: '2025.06.01', last: '방금' },
]

// 관리자 — 세무 일정 마스터 (data.jsx TAX_MASTER)
export const TAX_MASTER: AdminTaxScheduleDto[] = [
  { id: 't1', cat: 'with', title: '원천세 신고·납부', period: '매월 10일', source: 'api', cycle: '매월', updated: '2026.06.01' },
  { id: 't2', cat: 'vat', title: '1기 부가가치세 예정고지', period: '2026.06.25', source: 'api', cycle: '분기', updated: '2026.06.01' },
  { id: 't3', cat: 'income', title: '종합소득세 확정신고', period: '2026.05.31', source: 'api', cycle: '연 1회', updated: '2026.05.01' },
  { id: 't4', cat: 'income', title: '성실신고확인대상자 종소세', period: '2026.06.30', source: 'api', cycle: '연 1회', updated: '2026.05.01' },
  { id: 't5', cat: 'corp', title: '3월 결산법인 법인세 신고', period: '2026.06.30', source: 'manual', cycle: '연 1회', updated: '2026.06.03' },
  { id: 't6', cat: 'insure', title: '4대보험료 납부', period: '매월 10일', source: 'api', cycle: '매월', updated: '2026.06.01' },
  { id: 't7', cat: 'vat', title: '1기 부가가치세 확정신고', period: '2026.07.25', source: 'api', cycle: '분기', updated: '2026.06.10' },
  { id: 't8', cat: 'insure', title: '지방소득세 특별징수분 납부', period: '매월 10일', source: 'manual', cycle: '매월', updated: '2026.06.02' },
]

// 관리자 — 발송 알림 내역 (data.jsx SENT)
export const SENT: SentDto[] = [
  { id: 's1', title: '원천세 신고 D-4 알림', cat: 'with', recipients: 1284, read: 712, channel: '앱·이메일', sent: '2026.06.06 09:00' },
  { id: 's2', title: '4대보험료 납부 안내', cat: 'insure', recipients: 1284, read: 690, channel: '앱', sent: '2026.06.06 09:00' },
  { id: 's3', title: '부가세 예정고지 발송 안내', cat: 'vat', recipients: 842, read: 521, channel: '앱·이메일', sent: '2026.06.13 16:20' },
  { id: 's4', title: '종합소득세 신고기한 안내', cat: 'income', recipients: 1284, read: 980, channel: '앱·이메일', sent: '2026.06.09 10:00' },
  { id: 's5', title: '법인세 신고 D-7 알림', cat: 'corp', recipients: 318, read: 145, channel: '앱', sent: '2026.06.23 09:00' },
]
