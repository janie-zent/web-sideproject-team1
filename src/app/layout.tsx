import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '세무일정관리',
  description: '세무 일정을 관리하는 풀스택 Next.js + IndexedDB 앱',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
