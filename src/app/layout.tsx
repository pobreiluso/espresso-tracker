import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ToastProvider } from '@/components/ui/Toast'

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
        <AuthProvider>
          <ToastProvider>
            <ProtectedRoute>
              <div className="min-h-screen bg-background">
                {children}
              </div>
            </ProtectedRoute>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}