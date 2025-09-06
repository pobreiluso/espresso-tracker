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