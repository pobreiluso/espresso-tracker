'use client'

import { useState } from 'react'
import { signInWithMagicLink } from '@/lib/auth'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await signInWithMagicLink(email)
      setMessage('Check your email for the magic link!')
    } catch (error) {
      setMessage('Error sending magic link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">
            ☕ Coffee Tracker
          </h1>
          <p className="text-subtext1">
            Sign in to track your specialty coffee journey
          </p>
        </div>

        <form onSubmit={handleSignIn} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </div>

          {message && (
            <div className={`text-sm text-center ${
              message.includes('Error') ? 'text-destructive' : 'text-green'
            }`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}