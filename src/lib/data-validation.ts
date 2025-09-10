// Data validation utilities for extracted bag information
import { BREW_VALIDATION } from './constants'

// Brew parameter validation utilities
export function validateBrewParameter(
  value: number | string | null | undefined,
  paramType: keyof typeof BREW_VALIDATION
): number {
  const config = BREW_VALIDATION[paramType]
  const numValue = sanitizeNumericValue(value)
  
  if (numValue === null) return config.default
  return Math.max(config.min, Math.min(config.max, numValue))
}

export function sanitizeNumericValue(value: any): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }
  
  if (typeof value === 'string') {
    // Remove common non-numeric text
    const cleaned = value.toLowerCase()
      .replace(/not specified|n\/a|unknown|unavailable|none/g, '')
      .replace(/[^\d.-]/g, '') // Keep only digits, dots, and dashes
    
    if (cleaned === '' || cleaned === '-') {
      return null
    }
    
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? null : parsed
  }
  
  if (typeof value === 'number') {
    return isNaN(value) ? null : value
  }
  
  return null
}

export function sanitizeYear(value: any): number | null {
  const year = sanitizeNumericValue(value)
  if (year === null) return null
  
  // Validate year range (coffee roasting started around 1400s, future limit)
  if (year < 1400 || year > new Date().getFullYear() + 10) {
    return null
  }
  
  return year
}

export function sanitizeAltitude(value: any): number | null {
  const altitude = sanitizeNumericValue(value)
  if (altitude === null) return null
  
  // Validate altitude range (sea level to highest coffee farms ~3000m)
  if (altitude < 0 || altitude > 4000) {
    return null
  }
  
  return altitude
}

export function sanitizeCuppingScore(value: any): number | null {
  const score = sanitizeNumericValue(value)
  if (score === null) return null
  
  // SCA cupping scores are 0-100
  if (score < 0 || score > 100) {
    return null
  }
  
  return score
}

export function sanitizeFlavorScore(value: any): number | null {
  const score = sanitizeNumericValue(value)
  if (score === null) return null
  
  // Flavor profile scores are typically 1-10
  if (score < 1 || score > 10) {
    return null
  }
  
  return score
}

export function sanitizeStringValue(value: any): string | null {
  if (value === null || value === undefined) {
    return null
  }
  
  if (typeof value !== 'string') {
    value = String(value)
  }
  
  const cleaned = value.trim()
  
  // Check for common "not specified" patterns
  const notSpecifiedPatterns = [
    /^not specified$/i,
    /^n\/a$/i,
    /^unknown$/i,
    /^unavailable$/i,
    /^none$/i,
    /^null$/i,
    /^undefined$/i,
    /^-+$/,
    /^\s*$/
  ]
  
  for (const pattern of notSpecifiedPatterns) {
    if (pattern.test(cleaned)) {
      return null
    }
  }
  
  return cleaned
}

export function sanitizeFlavorProfile(profile: any): any {
  if (!profile || typeof profile !== 'object') {
    return null
  }
  
  const sanitized: any = {}
  
  // Sanitize numeric scores
  const numericFields = ['acidity', 'body', 'sweetness', 'aroma', 'balance', 'aftertaste']
  for (const field of numericFields) {
    if (field in profile) {
      sanitized[field] = sanitizeFlavorScore(profile[field])
    }
  }
  
  // Sanitize notes array
  if (profile.notes && Array.isArray(profile.notes)) {
    const sanitizedNotes = profile.notes
      .map((note: any) => sanitizeStringValue(note))
      .filter((note: any) => note !== null)
    
    if (sanitizedNotes.length > 0) {
      sanitized.notes = sanitizedNotes
    }
  }
  
  // Return null if no valid data
  return Object.keys(sanitized).length > 0 ? sanitized : null
}