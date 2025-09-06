'use client'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  // Authentication temporarily disabled for development
  return <>{children}</>
}