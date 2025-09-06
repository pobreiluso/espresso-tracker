import { Database } from './database'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Entity types
export type Roaster = Tables<'roasters'>
export type Coffee = Tables<'coffees'>
export type Bag = Tables<'bags'>
export type Brew = Tables<'brews'>
export type UserPreferences = Tables<'user_preferences'>

// Insert types
export type RoasterInsert = TablesInsert<'roasters'>
export type CoffeeInsert = TablesInsert<'coffees'>
export type BagInsert = TablesInsert<'bags'>
export type BrewInsert = TablesInsert<'brews'>
export type UserPreferencesInsert = TablesInsert<'user_preferences'>

// Update types
export type RoasterUpdate = TablesUpdate<'roasters'>
export type CoffeeUpdate = TablesUpdate<'coffees'>
export type BagUpdate = TablesUpdate<'bags'>
export type BrewUpdate = TablesUpdate<'brews'>
export type UserPreferencesUpdate = TablesUpdate<'user_preferences'>

// Extended types with relations
export type CoffeeWithRoaster = Coffee & {
  roaster: Roaster
}

export type BagWithCoffeeAndRoaster = Bag & {
  coffee: CoffeeWithRoaster
}

export type BrewWithBagAndCoffee = Brew & {
  bag: BagWithCoffeeAndRoaster
  // AI Analysis fields (optional since they may not exist on all brews)
  ai_analysis?: any | null
  extraction_quality?: string | null
  brewing_method_detected?: string | null
  visual_score?: number | null
  confidence_score?: number | null
  has_ai_analysis?: boolean | null
  extraction_time_seconds?: number | null
  dose_grams?: number | null
  yield_grams?: number | null
  water_temp_celsius?: number | null
  estimated_volume_ml?: number | null
  photo_url?: string | null
  analysis_timestamp?: string | null
}

// Enums
export type BrewMethod = 'espresso' | 'v60' | 'aeropress' | 'chemex' | 'kalita' | 'frenchpress'

// Form types
export interface CreateRoasterForm {
  name: string
  country?: string
  website?: string
}

export interface CreateCoffeeForm {
  roaster_id: string
  name: string
  origin_country?: string
  region?: string
  farm?: string
  variety?: string
  process?: string
  altitude?: number
  tasting_notes?: string
}

export interface CreateBagForm {
  coffee_id: string
  size_g: number
  price?: number
  roast_date: string
  open_date?: string
  purchase_location?: string
}

export interface CreateBrewForm {
  bag_id: string
  method: BrewMethod
  dose_g: number
  yield_g: number
  time_s: number
  grind_setting: string
  water_temp_c?: number
  rating: number
  flavor_tags?: string[]
  notes?: string
  brew_date?: string
}

// AI Brew Analysis Types
export interface BrewAnalysis {
  extraction_analysis: {
    quality: 'under-extracted' | 'properly-extracted' | 'over-extracted'
    confidence: number
    strength: 'light' | 'medium' | 'strong'
    defects: string[]
  }
  brewing_method: {
    detected_method: 'espresso' | 'pour-over' | 'french-press' | 'aeropress' | 'drip' | 'other'
    confidence: number
    indicators: string[]
  }
  volume_estimation: {
    estimated_ml: number
    confidence: number
    cup_type: string
  }
  crema_analysis: {
    present: boolean
    color: 'golden' | 'dark' | 'light' | 'absent'
    thickness: 'thin' | 'medium' | 'thick'
    coverage: 'full' | 'partial' | 'patchy' | 'none'
    quality_score: number
  }
  visual_characteristics: {
    color: string
    opacity: 'transparent' | 'translucent' | 'opaque'
    clarity: 'clear' | 'slightly cloudy' | 'cloudy' | 'muddy'
    surface_appearance: 'smooth' | 'foamy' | 'bubbly' | 'oily'
  }
  quality_assessment: {
    overall_score: number
    positive_aspects: string[]
    areas_for_improvement: string[]
    recommendations: string[]
  }
  technical_analysis: {
    extraction_indicators: {
      sourness_risk: 'low' | 'medium' | 'high'
      bitterness_risk: 'low' | 'medium' | 'high'
      balance_assessment: 'under' | 'balanced' | 'over'
    }
    suggested_adjustments: {
      grind_size: 'finer' | 'current' | 'coarser'
      dose_adjustment: 'increase' | 'maintain' | 'decrease'
      time_adjustment: 'shorter' | 'current' | 'longer'
    }
  }
  confidence_overall: number
  _mock?: boolean
  _error?: string
}

export interface CreateBrewWithAnalysisForm {
  bag_id: string
  grind_setting?: number
  extraction_time_seconds?: number
  dose_grams?: number
  yield_grams?: number
  water_temp_celsius?: number
  rating?: number
  notes?: string
  photo?: File
  brewing_method?: string
}