import crypto from 'crypto'

/**
 * Security utility functions for the application
 */

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return ''
  
  return input
    .replace(/[<>'"&]/g, (char) => {
      const entities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      }
      return entities[char] || char
    })
    .trim()
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Rate limiting helper (simple in-memory implementation)
 */
class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>()

  isRateLimited(identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now()
    const windowStart = now - windowMs
    
    // Clean old entries
    for (const [key, data] of this.requests.entries()) {
      if (data.resetTime < windowStart) {
        this.requests.delete(key)
      }
    }
    
    const current = this.requests.get(identifier)
    
    if (!current || current.resetTime < windowStart) {
      this.requests.set(identifier, { count: 1, resetTime: now + windowMs })
      return false
    }
    
    if (current.count >= maxRequests) {
      return true
    }
    
    current.count++
    return false
  }
}

export const rateLimiter = new RateLimiter()

/**
 * Validate file upload security
 */
export function validateFileUpload(file: File): { isValid: boolean; error?: string } {
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size too large' }
  }

  // Check allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type' }
  }

  // Check file extension matches MIME type
  const extension = file.name.toLowerCase().split('.').pop()
  const typeExtensionMap: { [key: string]: string[] } = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp']
  }

  const allowedExtensions = typeExtensionMap[file.type] || []
  if (!extension || !allowedExtensions.includes(extension)) {
    return { isValid: false, error: 'File extension does not match type' }
  }

  return { isValid: true }
}

/**
 * Environment variable validation
 */
export function validateEnvironmentVariables(): { isValid: boolean; missingVars: string[] } {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]

  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  return {
    isValid: missingVars.length === 0,
    missingVars
  }
}

/**
 * CSRF token validation
 */
export function validateCSRFToken(token: string | null, sessionToken: string): boolean {
  if (!token || !sessionToken) return false
  
  try {
    // Simple CSRF validation - should be replaced with proper implementation
    const expected = crypto.createHmac('sha256', sessionToken).update('csrf').digest('hex')
    return crypto.timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(sessionToken: string): string {
  return crypto.createHmac('sha256', sessionToken).update('csrf').digest('hex')
}

/**
 * Content Security Policy header value
 */
export function getCSPHeader(): string {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const policies = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Relaxed for Next.js
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.supabase.co",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co https://api.openai.com",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ]
  
  if (isDevelopment) {
    policies.push("connect-src 'self' ws: wss: https://*.supabase.co https://api.openai.com http://127.0.0.1:*")
  }
  
  return policies.join('; ')
}

/**
 * Secure error message that doesn't leak sensitive information
 */
export function getSecureErrorMessage(error: unknown): string {
  if (process.env.NODE_ENV === 'development') {
    return error instanceof Error ? error.message : 'Unknown error'
  }
  
  // In production, return generic error messages to avoid information disclosure
  return 'An error occurred while processing your request'
}

/**
 * Validate and sanitize JSON input to prevent prototype pollution
 */
export function safeJSONParse<T = any>(jsonString: string): T | null {
  try {
    const parsed = JSON.parse(jsonString)
    
    // Basic prototype pollution check
    if (parsed && typeof parsed === 'object') {
      if ('__proto__' in parsed || 'constructor' in parsed || 'prototype' in parsed) {
        throw new Error('Potential prototype pollution detected')
      }
    }
    
    return parsed
  } catch (error) {
    console.error('JSON parsing error:', error)
    return null
  }
}