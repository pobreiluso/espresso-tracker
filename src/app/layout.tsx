import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthGuard from '@/components/AuthGuard'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Coffee Tracker',
  description: 'Track your specialty coffee purchases and brewing sessions',
  manifest: '/manifest.json',
  themeColor: '#24273a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthGuard>
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </AuthGuard>
      </body>
    </html>
  )
}