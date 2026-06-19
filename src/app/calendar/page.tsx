import type { Metadata } from 'next'
import './calendar.css'
import Calendar from './Calendar'

export const metadata: Metadata = {
  title: '올챙이 — 캘린더',
  description: '세무 + 개인 일정을 한눈에 보는 월간 캘린더',
}

export default function CalendarPage() {
  return (
    <div className="olc">
      <Calendar />
    </div>
  )
}
