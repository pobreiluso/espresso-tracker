import { BREWING_METHODS, type BrewMethodKey, type BrewMethodValue } from './constants'
import { BrewMethod } from '@/types'
import { validateParameter } from './validation'

/**
 * Maps detected brewing method from AI analysis to valid BrewMethod enum
 */
export function mapBrewingMethod(detectedMethod?: string): BrewMethod {
  if (!detectedMethod) return 'v60'
  
  const normalizedMethod = detectedMethod.toLowerCase().trim()
  
  // Try direct mapping first
  if (normalizedMethod in BREWING_METHODS) {
    return BREWING_METHODS[normalizedMethod as BrewMethodKey] as BrewMethod
  }
  
  // Try partial matches
  for (const [key, value] of Object.entries(BREWING_METHODS)) {
    if (normalizedMethod.includes(key)) {
      return value as BrewMethod
    }
  }
  
  // Default fallback
  return 'v60'
}

/**
 * Creates a standardized brew data object with validated parameters
 */
export function createBrewData(params: {
  bagId: string
  userId: string
  grindSetting?: number | string
  extractionTime?: number
  doseGrams?: number
  yieldGrams?: number
  waterTemp?: number
  rating?: number
  notes?: string
  detectedMethod?: string
  analysis?: any
  photoUrl?: string | null
}) {
  const {
    bagId,
    userId,
    grindSetting,
    extractionTime,
    doseGrams,
    yieldGrams,
    waterTemp,
    rating = 5,
    notes = '',
    detectedMethod,
    analysis,
    photoUrl
  } = params


  const mappedMethod = mapBrewingMethod(detectedMethod)
  
  return {
    bag_id: bagId,
    method: mappedMethod,
    dose_g: validateParameter(doseGrams, 'DOSE_G'),
    yield_g: yieldGrams || analysis?.volume_estimation?.estimated_ml || validateParameter(yieldGrams, 'YIELD_G'),
    time_s: validateParameter(extractionTime, 'TIME_S'),
    grind_setting: grindSetting ? String(grindSetting) : 'medium',
    water_temp_c: validateParameter(waterTemp, 'WATER_TEMP_C'),
    rating: validateParameter(rating, 'RATING'),
    notes: notes || (analysis?.quality_assessment?.recommendations?.join('. ') || ''),
    brew_date: new Date().toISOString(),
    
    // Analysis fields
    extraction_time_seconds: extractionTime || null,
    dose_grams: doseGrams || null,
    yield_grams: yieldGrams || null,
    water_temp_celsius: waterTemp || null,
    ai_analysis: analysis as any || null,
    extraction_quality: analysis?.extraction_analysis?.quality || null,
    brewing_method_detected: analysis?.brewing_method?.detected_method || null,
    estimated_volume_ml: analysis?.volume_estimation?.estimated_ml || null,
    visual_score: analysis?.quality_assessment?.overall_score || null,
    confidence_score: analysis?.confidence_overall || null,
    photo_url: photoUrl,
    has_photo: !!photoUrl,
    has_ai_analysis: !!analysis,
    user_id: userId
  }
}