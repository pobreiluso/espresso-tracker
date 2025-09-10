// Unified validation utilities for all application data
import { BREW_VALIDATION } from './constants'

export interface ValidationConfig {
  min: number
  max: number
  default: number
}

export interface ValidationConfigs {
  DOSE_G: ValidationConfig
  YIELD_G: ValidationConfig
  TIME_S: ValidationConfig
  WATER_TEMP_C: ValidationConfig
  RATING: ValidationConfig
  GRIND_SETTING: ValidationConfig
  CUPPING_SCORE: ValidationConfig
  ALTITUDE: ValidationConfig
  FOUNDED_YEAR: ValidationConfig
  FLAVOR_SCORE: ValidationConfig
}

export const VALIDATION_CONFIGS: ValidationConfigs = {
  DOSE_G: { min: 5, max: 30, default: 18 },
  YIELD_G: { min: 10, max: 100, default: 30 },
  TIME_S: { min: 5, max: 90, default: 25 },
  WATER_TEMP_C: { min: 80, max: 100, default: 93 },
  RATING: { min: 1, max: 10, default: 5 },
  GRIND_SETTING: { min: 1, max: 40, default: 15 },
  CUPPING_SCORE: { min: 0, max: 100, default: 85 },
  ALTITUDE: { min: 0, max: 4000, default: 1500 },
  FOUNDED_YEAR: { min: 1400, max: new Date().getFullYear() + 10, default: 2000 },
  FLAVOR_SCORE: { min: 1, max: 10, default: 5 }
}

/**
 * Validates and sanitizes a numeric parameter according to its configuration
 */
export function validateParameter(
  value: any,
  paramType: keyof ValidationConfigs
): number {
  const config = VALIDATION_CONFIGS[paramType]
  const numValue = sanitizeNumericValue(value)
  
  if (numValue === null) return config.default
  return Math.max(config.min, Math.min(config.max, numValue))
}

/**
 * Sanitizes any value to a number or null
 */
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

/**
 * Sanitizes string values by removing common "not specified" patterns
 */
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

/**
 * Validates date strings and returns ISO date string or null
 */
export function sanitizeDate(value: any): string | null {
  if (!value) return null
  
  try {
    const date = new Date(value)
    if (isNaN(date.getTime())) return null
    
    // Check if date is reasonable (not too far in past or future)
    const minDate = new Date('1400-01-01')
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 10)
    
    if (date < minDate || date > maxDate) return null
    
    return date.toISOString().split('T')[0] // Return YYYY-MM-DD format
  } catch {
    return null
  }
}

/**
 * Validates and sanitizes flavor profile objects
 */
export function sanitizeFlavorProfile(profile: any): any {
  if (!profile || typeof profile !== 'object') {
    return null
  }
  
  const sanitized: any = {}
  
  // Sanitize numeric scores
  const numericFields = ['acidity', 'body', 'sweetness', 'aroma', 'balance', 'aftertaste']
  for (const field of numericFields) {
    if (field in profile) {
      const score = sanitizeNumericValue(profile[field])
      if (score !== null && score >= 1 && score <= 10) {
        sanitized[field] = score
      }
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

/**
 * Validates price values
 */
export function sanitizePrice(value: any): number | null {
  const price = sanitizeNumericValue(value)
  if (price === null) return null
  
  // Price should be positive and reasonable (less than €1000)
  if (price < 0 || price > 1000) return null
  
  // Round to 2 decimal places
  return Math.round(price * 100) / 100
}

/**
 * Validates and sanitizes URLs
 */
export function sanitizeUrl(value: any): string | null {
  const url = sanitizeStringValue(value)
  if (!url) return null
  
  try {
    // Add https:// if no protocol is specified
    const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`
    const parsed = new URL(urlWithProtocol)
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }
    
    return parsed.toString()
  } catch {
    return null
  }
}

// Re-export legacy functions for backwards compatibility
export { validateBrewParameter } from './data-validation'
export {
  sanitizeYear,
  sanitizeAltitude,
  sanitizeCuppingScore,
  sanitizeFlavorScore
} from './data-validation'