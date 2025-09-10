import { Database } from './database'

/**
 * Utility type to extract the Row type from a Supabase table
 * @template T - The table name from the database schema
 */
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

/**
 * Utility type to extract the Insert type from a Supabase table
 * @template T - The table name from the database schema
 */
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']

/**
 * Utility type to extract the Update type from a Supabase table
 * @template T - The table name from the database schema
 */
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Entity types

/** Coffee roaster entity with basic information and branding details */
export type Roaster = Tables<'roasters'>

/** Coffee entity containing origin, processing, and flavor information */
export type Coffee = Tables<'coffees'>

/** Coffee bag entity representing a specific purchase with roast date and pricing */
export type Bag = Tables<'bags'>

/** Brew session entity containing brewing parameters and quality assessments */
export type Brew = Tables<'brews'>

/** User preferences for brewing defaults and personalization settings */
export type UserPreferences = Tables<'user_preferences'>

// Insert types

/** Type for inserting new roaster records */
export type RoasterInsert = TablesInsert<'roasters'>

/** Type for inserting new coffee records */
export type CoffeeInsert = TablesInsert<'coffees'>

/** Type for inserting new bag records */
export type BagInsert = TablesInsert<'bags'>

/** Type for inserting new brew records */
export type BrewInsert = TablesInsert<'brews'>

/** Type for inserting new user preferences records */
export type UserPreferencesInsert = TablesInsert<'user_preferences'>

// Update types

/** Type for updating existing roaster records */
export type RoasterUpdate = TablesUpdate<'roasters'>

/** Type for updating existing coffee records */
export type CoffeeUpdate = TablesUpdate<'coffees'>

/** Type for updating existing bag records */
export type BagUpdate = TablesUpdate<'bags'>

/** Type for updating existing brew records */
export type BrewUpdate = TablesUpdate<'brews'>

/** Type for updating existing user preferences records */
export type UserPreferencesUpdate = TablesUpdate<'user_preferences'>

// Extended types with relations

/** Coffee entity with populated roaster relationship */
export type CoffeeWithRoaster = Coffee & {
  roaster: Roaster
}

/** Bag entity with populated coffee and roaster relationships */
export type BagWithCoffeeAndRoaster = Bag & {
  coffee: CoffeeWithRoaster
}

/** 
 * Brew entity with populated bag/coffee/roaster relationships and AI analysis fields
 * Includes optional AI-generated analysis data for enhanced brew tracking
 */
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

/** Supported brewing methods for coffee preparation */
export type BrewMethod = 'espresso' | 'v60' | 'aeropress' | 'chemex' | 'kalita' | 'frenchpress'

// Form types

/** Form interface for creating new coffee roasters */
export interface CreateRoasterForm {
  /** Roaster name (required) */
  name: string
  /** Roaster's country of origin */
  country?: string
  /** Roaster's website URL */
  website?: string
}

/** Form interface for creating new coffee entries */
export interface CreateCoffeeForm {
  /** ID of the roaster who produced this coffee */
  roaster_id: string
  /** Coffee name or blend name */
  name: string
  /** Country where coffee was grown */
  origin_country?: string
  /** Growing region within the country */
  region?: string
  /** Specific farm or estate name */
  farm?: string
  /** Coffee variety/cultivar */
  variety?: string
  /** Processing method (washed, natural, etc.) */
  process?: string
  /** Growing altitude in meters */
  altitude?: number
  /** Tasting notes and flavor descriptors */
  tasting_notes?: string
}

/** Form interface for creating new coffee bag entries */
export interface CreateBagForm {
  /** ID of the coffee this bag contains */
  coffee_id: string
  /** Bag size in grams */
  size_g: number
  /** Purchase price */
  price?: number
  /** Date the coffee was roasted */
  roast_date: string
  /** Date the bag was opened */
  open_date?: string
  /** Where the bag was purchased */
  purchase_location?: string
}

/** Form interface for creating new brew sessions */
export interface CreateBrewForm {
  /** ID of the coffee bag used for this brew */
  bag_id: string
  /** Brewing method used */
  method: BrewMethod
  /** Coffee dose in grams */
  dose_g: number
  /** Final yield/output in grams */
  yield_g: number
  /** Extraction time in seconds */
  time_s: number
  /** Grinder setting used */
  grind_setting: string
  /** Water temperature in Celsius */
  water_temp_c?: number
  /** User rating (1-10) */
  rating: number
  /** Flavor tags for categorization */
  flavor_tags?: string[]
  /** Additional notes about the brew */
  notes?: string
  /** Date of the brew session */
  brew_date?: string
}

// Enhanced AI Brew Analysis Types

/** 
 * Detailed brewing recommendation with scientific backing and expected impact
 */
export interface DetailedRecommendation {
  /** The specific recommendation to improve the brew */
  recommendation: string
  /** Scientific reasoning behind the recommendation */
  scientific_reasoning: string
  /** Expected impact on flavor and quality */
  expected_flavor_impact: string
  /** Priority level for implementing this recommendation */
  priority: 'low' | 'medium' | 'high'
}

/**
 * Comprehensive AI-powered brew analysis containing extraction quality assessment,
 * brewing method detection, visual characteristics, and actionable recommendations
 */
export interface BrewAnalysis {
  /** Analysis of coffee extraction quality and characteristics */
  extraction_analysis: {
    /** Overall extraction quality assessment */
    quality: 'under-extracted' | 'properly-extracted' | 'over-extracted'
    /** Confidence level in the assessment (0-1) */
    confidence: number
    /** Perceived strength of the brew */
    strength: 'light' | 'medium' | 'strong'
    /** List of detected extraction defects */
    defects: string[]
    /** Scientific explanation for the quality assessment */
    scientific_reasoning: string
  }
  /** Detection and analysis of brewing method used */
  brewing_method: {
    /** Detected brewing method from visual cues */
    detected_method: 'espresso' | 'pour-over' | 'french-press' | 'aeropress' | 'drip' | 'other'
    /** Confidence in method detection (0-1) */
    confidence: number
    /** Visual indicators that led to method identification */
    indicators: string[]
    /** Method-specific observations and notes */
    method_specific_notes: string
  }
  /** Estimation of brew volume and cup characteristics */
  volume_estimation: {
    /** Estimated volume in milliliters */
    estimated_ml: number
    /** Confidence in volume estimation (0-1) */
    confidence: number
    /** Type of cup or vessel detected */
    cup_type: string
  }
  /** Analysis of crema quality and characteristics (for espresso) */
  crema_analysis: {
    /** Whether crema is present */
    present: boolean
    /** Color classification of the crema */
    color: 'golden' | 'dark' | 'light' | 'absent'
    /** Thickness assessment */
    thickness: 'thin' | 'medium' | 'thick'
    /** Coverage extent across the surface */
    coverage: 'full' | 'partial' | 'patchy' | 'none'
    /** Quality score (0-10) */
    quality_score: number
    /** Scientific notes about crema formation */
    crema_science_notes: string
  }
  visual_characteristics: {
    color: string
    opacity: 'transparent' | 'translucent' | 'opaque'
    clarity: 'clear' | 'slightly cloudy' | 'cloudy' | 'muddy'
    surface_appearance: 'smooth' | 'foamy' | 'bubbly' | 'oily'
    particle_analysis: string
  }
  quality_assessment: {
    overall_score: number
    positive_aspects: string[]
    areas_for_improvement: string[]
    detailed_recommendations: DetailedRecommendation[]
    professional_notes: string
    // Keep old recommendations for backward compatibility
    recommendations?: string[]
  }
  technical_analysis: {
    extraction_indicators: {
      sourness_risk: 'low' | 'medium' | 'high'
      bitterness_risk: 'low' | 'medium' | 'high'
      balance_assessment: 'under' | 'balanced' | 'over'
      tds_estimation: string
      extraction_yield_estimate: string
    }
    suggested_adjustments: {
      grind_size: 'finer' | 'current' | 'coarser'
      dose_adjustment: 'increase' | 'maintain' | 'decrease'
      time_adjustment: 'shorter' | 'current' | 'longer'
      temperature_adjustment: 'maintain' | 'increase' | 'decrease'
      technique_notes: string
    }
    equipment_specific_advice: string
  }
  professional_insights: {
    extraction_science_explanation: string
    flavor_prediction: string
    brewing_mastery_tips: string
  }
  confidence_overall: number
  _mock?: boolean
  _error?: string
}

/**
 * Form interface for creating brews with AI-powered photo analysis
 * Supports optional brewing parameters and photo upload for analysis
 */
export interface CreateBrewWithAnalysisForm {
  /** ID of the coffee bag used for this brew */
  bag_id: string
  /** Grinder setting (numeric scale) */
  grind_setting?: number
  /** Extraction time in seconds */
  extraction_time_seconds?: number
  /** Coffee dose in grams */
  dose_grams?: number
  /** Final yield/output in grams */
  yield_grams?: number
  /** Water temperature in Celsius */
  water_temp_celsius?: number
  /** User rating (1-10) */
  rating?: number
  /** Additional notes about the brew */
  notes?: string
  /** Photo file for AI analysis */
  photo?: File
  /** Brewing method for context */
  brewing_method?: string
}