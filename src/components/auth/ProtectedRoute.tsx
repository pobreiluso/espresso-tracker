'use client'

import { useAuth } from '@/lib/auth-context'
import { AuthModal } from './AuthModal'
import { useState, useEffect } from 'react'
import { Loader2, Coffee } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true)
    } else {
      setShowAuthModal(false)
    }
  }, [user, loading])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="text-center">
          <Coffee className="w-12 h-12 text-peach mx-auto mb-4" />
          <Loader2 className="w-8 h-8 animate-spin text-peach mx-auto mb-4" />
          <p className="text-text">Cargando...</p>
        </div>
      </div>
    )
  }

  // Show custom fallback if provided and user is not authenticated
  if (!user && fallback) {
    return <>{fallback}</>
  }

  // Show welcome screen with auth modal if user is not authenticated
  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-base flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <Coffee className="w-16 h-16 text-peach mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-text mb-4">
              Coffee Tracker
            </h1>
            <p className="text-subtext1 mb-8 text-lg">
              Bienvenido al mejor tracker de café. Registra tus catas, analiza tus extracciones y mejora tu técnica de brewing.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full py-3 bg-peach hover:bg-peach/90 text-crust font-medium rounded-xl transition-colors"
              >
                Empezar Ahora
              </button>
              
              <p className="text-sm text-subtext1">
                ☕ Registra tus cafés favoritos<br />
                📊 Analiza tus extracciones<br />
                🤖 IA que mejora tu técnica
              </p>
            </div>
          </div>
        </div>
        
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    )
  }

  // User is authenticated, render children
  return <>{children}</>
}