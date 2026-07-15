import type { Metadata } from 'next'
import './login.css'
import { LoginPage } from './LoginForm'

export const metadata: Metadata = {
  title: '올챙이 — 로그인',
  description: '세무 + 개인 일정을 한눈에 보는 올챙이 로그인',
}

export default function Page() {
  return <LoginPage />
}
