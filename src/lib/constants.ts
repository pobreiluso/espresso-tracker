// Validation constants for brew parameters
export const BREW_VALIDATION = {
  DOSE_G: { min: 5, max: 30, default: 18 },
  YIELD_G: { min: 10, max: 100, default: 30 },
  TIME_S: { min: 5, max: 90, default: 25 },
  WATER_TEMP_C: { min: 80, max: 100, default: 93 },
  RATING: { min: 1, max: 10, default: 5 },
  GRIND_SETTING: { min: 1, max: 50, default: 15 }
} as const

// Photo compression settings
export const PHOTO_SETTINGS = {
  MAX_WIDTH: 1200,
  QUALITY: 0.8,
  SUPPORTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
} as const

// UI constants
export const UI_CONSTANTS = {
  MODAL_ANIMATION_DURATION: 200,
  TOAST_DURATION: 3000,
  SUCCESS_REDIRECT_DELAY: 2000
} as const

// Brewing methods mapping
export const BREWING_METHODS = {
  'espresso': 'espresso',
  'pour': 'v60',
  'pour-over': 'v60',
  'v60': 'v60',
  'aeropress': 'aeropress',
  'chemex': 'chemex',
  'kalita': 'kalita',
  'french': 'frenchpress',
  'french-press': 'frenchpress',
  'press': 'frenchpress'
} as const

export type BrewMethodKey = keyof typeof BREWING_METHODS
export type BrewMethodValue = typeof BREWING_METHODS[BrewMethodKey]