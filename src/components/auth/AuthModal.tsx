'use client'

import { useState } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: 'signin' | 'signup'
}

export function AuthModal({ isOpen, onClose, defaultMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(defaultMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const { signIn, signUp, resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      let result
      
      if (mode === 'signin') {
        result = await signIn(email, password)
        if (!result.error) {
          onClose()
        }
      } else if (mode === 'signup') {
        result = await signUp(email, password)
        if (!result.error) {
          setMessage('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.')
          setMode('signin')
        }
      } else if (mode === 'reset') {
        result = await resetPassword(email)
        if (!result.error) {
          setMessage('¡Email de recuperación enviado! Revisa tu bandeja de entrada.')
        }
      }

      if (result?.error) {
        setError(getErrorMessage(result.error.message))
      }
    } catch (err) {
      setError('Ha ocurrido un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const getErrorMessage = (error: string) => {
    if (error.includes('Invalid login credentials')) {
      return 'Email o contraseña incorrectos'
    }
    if (error.includes('Email not confirmed')) {
      return 'Por favor, confirma tu email antes de iniciar sesión'
    }
    if (error.includes('Password should be at least 6 characters')) {
      return 'La contraseña debe tener al menos 6 caracteres'
    }
    if (error.includes('User already registered')) {
      return 'Este email ya está registrado'
    }
    return error
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl p-6 w-full max-w-md border border-surface1">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text">
            {mode === 'signin' && 'Iniciar Sesión'}
            {mode === 'signup' && 'Crear Cuenta'}
            {mode === 'reset' && 'Recuperar Contraseña'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-surface0 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red/10 border border-red/20 rounded-lg text-red text-sm">
            {error}
          </div>
        )}
        
        {message && (
          <div className="mb-4 p-3 bg-green/10 border border-green/20 rounded-lg text-green text-sm">
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-subtext1" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface0 border border-surface1 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          {mode !== 'reset' && (
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-subtext1" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-surface0 border border-surface1 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-surface1 rounded transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-subtext1" />
                  ) : (
                    <Eye className="w-4 h-4 text-subtext1" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-peach hover:bg-peach/90 text-crust font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'signin' && 'Iniciar Sesión'}
            {mode === 'signup' && 'Crear Cuenta'}
            {mode === 'reset' && 'Enviar Email'}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          {mode === 'signin' && (
            <>
              <button
                type="button"
                onClick={() => setMode('reset')}
                className="text-sm text-subtext1 hover:text-text transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
              <div className="text-sm text-subtext1">
                ¿No tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-peach hover:underline font-medium"
                >
                  Regístrate
                </button>
              </div>
            </>
          )}
          
          {mode === 'signup' && (
            <div className="text-sm text-subtext1">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-peach hover:underline font-medium"
              >
                Inicia sesión
              </button>
            </div>
          )}
          
          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-sm text-subtext1 hover:text-text transition-colors"
            >
              ← Volver al login
            </button>
          )}
        </div>
      </div>
    </div>
  )
}