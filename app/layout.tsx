import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Getleads - Lead Generation Platform',
  description: 'A powerful lead generation platform to help grow your business',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
