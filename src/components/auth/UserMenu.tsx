'use client'

import { useState } from 'react'
import { User, LogOut, Settings, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export function UserMenu() {
  const { user, signOut, loading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut()
    setIsSigningOut(false)
    setIsOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center w-10 h-10">
        <Loader2 className="w-5 h-5 animate-spin text-subtext1" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 hover:bg-surface0 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 bg-peach/20 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-peach" />
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-text">
            {user.email?.split('@')[0]}
          </div>
          <div className="text-xs text-subtext1">
            {user.email}
          </div>
        </div>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-background border border-surface1 rounded-xl shadow-lg z-20 py-2">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-surface1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-peach/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-peach" />
                </div>
                <div>
                  <div className="font-medium text-text">
                    {user.email?.split('@')[0]}
                  </div>
                  <div className="text-sm text-subtext1">
                    {user.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => {
                  setIsOpen(false)
                  // TODO: Open settings modal
                }}
                className="w-full px-4 py-2 text-left hover:bg-surface0 transition-colors flex items-center gap-3 text-text"
              >
                <Settings className="w-4 h-4" />
                Configuración
              </button>
              
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full px-4 py-2 text-left hover:bg-surface0 transition-colors flex items-center gap-3 text-red disabled:opacity-50"
              >
                {isSigningOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                Cerrar Sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}