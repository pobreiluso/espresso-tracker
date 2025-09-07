import { supabase } from './supabase'
import { RoasterInsert, CoffeeInsert, BagInsert } from '@/types'
import { 
  sanitizeStringValue, 
  sanitizeNumericValue, 
  sanitizeYear, 
  sanitizeAltitude, 
  sanitizeCuppingScore,
  sanitizeFlavorProfile 
} from './data-validation'
import { findBestCoffeeMatchByCharacteristics } from './coffee-matching'
import { getCurrentUserId } from './auth-utils'

export interface ExtractedBagInfo {
  roaster: {
    name: string
    country?: string
    website?: string
    description?: string
    founded_year?: number
    specialty?: string
    size_category?: string
    roasting_style?: string
  }
  coffee: {
    name: string
    origin_country?: string
    region?: string
    subregion?: string
    farm?: string
    producer?: string
    cooperative?: string
    variety?: string
    variety_details?: string
    process?: string
    process_details?: string
    altitude?: number
    altitude_range?: string
    harvest_season?: string
    certification?: string
    cupping_score?: number
    tasting_notes?: string
    flavor_profile?: {
      acidity?: number
      body?: number
      sweetness?: number
      aroma?: number
      balance?: number
      aftertaste?: number
      notes?: string[]
    }
    coffee_story?: string
  }
  bag: {
    size_g: number
    roast_date?: string
    price?: number
    purchase_location?: string
  }
  confidence: number
}

export async function extractBagInfoFromImage(file: File): Promise<ExtractedBagInfo> {
  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch('/api/extract-bag-info', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error('Failed to extract bag information')
  }

  return response.json()
}

export async function findOrCreateRoaster(roasterData: ExtractedBagInfo['roaster']) {
  try {
    // First try to find existing roaster by name globally
    const { data: existingRoasters, error: searchError } = await supabase
      .from('roasters')
      .select('*')
      .ilike('name', roasterData.name)
      .limit(1)

    if (searchError) {
      console.error('Error searching for roaster:', searchError)
      throw new Error(`Failed to search for roaster: ${searchError.message}`)
    }

    if (existingRoasters && existingRoasters.length > 0) {
      return existingRoasters[0]
    }

    // Create new roaster with sanitized data (user_id null for global access)
    const roasterInsert: RoasterInsert = {
      name: sanitizeStringValue(roasterData.name) || roasterData.name,
      country: sanitizeStringValue(roasterData.country),
      website: sanitizeStringValue(roasterData.website),
      description: sanitizeStringValue(roasterData.description),
      founded_year: sanitizeYear(roasterData.founded_year),
      specialty: sanitizeStringValue(roasterData.specialty),
      size_category: sanitizeStringValue(roasterData.size_category),
      roasting_style: sanitizeStringValue(roasterData.roasting_style),
      user_id: null // Global roaster, no specific user
    }

    const { data: newRoaster, error: insertError } = await supabase
      .from('roasters')
      .insert(roasterInsert)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating roaster:', insertError)
      throw new Error(`Failed to create roaster: ${insertError.message}`)
    }
    
    return newRoaster
  } catch (error) {
    console.error('Error in findOrCreateRoaster:', error)
    throw error
  }
}

export async function findOrCreateCoffee(
  coffeeData: ExtractedBagInfo['coffee'], 
  roasterId: string
) {
  try {
    // Get all coffees from the same roaster with detailed characteristics for intelligent matching (global search)
    const { data: existingCoffees, error: searchError } = await supabase
      .from('coffees')
      .select('id, name, origin_country, region, farm, process, variety, altitude')
      .eq('roaster_id', roasterId)

    if (searchError) {
      console.error('Error searching for coffee:', searchError)
      throw new Error(`Failed to search for coffee: ${searchError.message}`)
    }

    // Use characteristics-based matching to find duplicate coffees
    if (existingCoffees && existingCoffees.length > 0) {
      const bestMatch = findBestCoffeeMatchByCharacteristics(coffeeData, existingCoffees, 0.8)
      
      if (bestMatch) {
        console.log(`Found similar coffee by characteristics:`)
        console.log(`  Target: "${coffeeData.name}" (${coffeeData.origin_country}, ${coffeeData.region}, ${coffeeData.farm}, ${coffeeData.process})`)
        console.log(`  Match: "${bestMatch.coffee.name}" (${bestMatch.coffee.origin_country}, ${bestMatch.coffee.region}, ${bestMatch.coffee.farm}, ${bestMatch.coffee.process})`)
        console.log(`  Similarity score: ${bestMatch.score}`)
        
        // Get the full coffee record
        const { data: fullCoffee, error: fetchError } = await supabase
          .from('coffees')
          .select('*')
          .eq('id', bestMatch.coffee.id)
          .single()

        if (fetchError) {
          console.error('Error fetching full coffee record:', fetchError)
        } else {
          return fullCoffee
        }
      }
    }

    console.log(`Creating new coffee: "${coffeeData.name}" (${coffeeData.origin_country}, ${coffeeData.region}, ${coffeeData.farm}, ${coffeeData.process})`)

    // Create new coffee with sanitized data (user_id null for global access)
    const coffeeInsert: CoffeeInsert = {
      roaster_id: roasterId,
      name: sanitizeStringValue(coffeeData.name) || coffeeData.name,
      origin_country: sanitizeStringValue(coffeeData.origin_country),
      region: sanitizeStringValue(coffeeData.region),
      subregion: sanitizeStringValue(coffeeData.subregion),
      farm: sanitizeStringValue(coffeeData.farm),
      producer: sanitizeStringValue(coffeeData.producer),
      cooperative: sanitizeStringValue(coffeeData.cooperative),
      variety: sanitizeStringValue(coffeeData.variety),
      variety_details: sanitizeStringValue(coffeeData.variety_details),
      process: sanitizeStringValue(coffeeData.process),
      process_details: sanitizeStringValue(coffeeData.process_details),
      altitude: sanitizeAltitude(coffeeData.altitude),
      altitude_range: sanitizeStringValue(coffeeData.altitude_range),
      harvest_season: sanitizeStringValue(coffeeData.harvest_season),
      certification: sanitizeStringValue(coffeeData.certification),
      cupping_score: sanitizeCuppingScore(coffeeData.cupping_score),
      tasting_notes: sanitizeStringValue(coffeeData.tasting_notes),
      flavor_profile: sanitizeFlavorProfile(coffeeData.flavor_profile),
      coffee_story: sanitizeStringValue(coffeeData.coffee_story),
      user_id: null // Global coffee, no specific user
    }

    const { data: newCoffee, error: insertError } = await supabase
      .from('coffees')
      .insert(coffeeInsert)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating coffee:', insertError)
      throw new Error(`Failed to create coffee: ${insertError.message}`)
    }
    
    return newCoffee
  } catch (error) {
    console.error('Error in findOrCreateCoffee:', error)
    throw error
  }
}

export async function createBagFromExtractedInfo(
  bagData: ExtractedBagInfo['bag'],
  coffeeId: string,
  photoUrl?: string | null
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    // Ensure size_g is always a valid number, default to 250g if unknown
    const sanitizedSizeG = sanitizeNumericValue(bagData.size_g)
    const finalSizeG = sanitizedSizeG !== null ? sanitizedSizeG : 250

    const bagInsert: BagInsert = {
      coffee_id: coffeeId,
      size_g: finalSizeG,
      price: sanitizeNumericValue(bagData.price),
      roast_date: sanitizeStringValue(bagData.roast_date) || new Date().toISOString().split('T')[0],
      purchase_location: sanitizeStringValue(bagData.purchase_location),
      photo_url: photoUrl,
      user_id: userId
    }

    const { data: newBag, error: insertError } = await supabase
      .from('bags')
      .insert(bagInsert)
      .select(`
        *,
        coffee:coffees (
          *,
          roaster:roasters (*)
        )
      `)
      .single()

    if (insertError) {
      console.error('Error creating bag:', insertError)
      throw new Error(`Failed to create bag: ${insertError.message}`)
    }
    
    return newBag
  } catch (error) {
    console.error('Error in createBagFromExtractedInfo:', error)
    throw error
  }
}

export async function processBagFromPhoto(extractedInfo: ExtractedBagInfo, photoUrl?: string | null) {
  try {
    console.log('Processing bag from photo with data:', extractedInfo)
    
    // Step 1: Find or create roaster
    console.log('Step 1: Finding or creating roaster:', extractedInfo.roaster.name)
    const roaster = await findOrCreateRoaster(extractedInfo.roaster)
    console.log('Roaster created/found:', roaster.id)
    
    // Step 2: Find or create coffee
    console.log('Step 2: Finding or creating coffee:', extractedInfo.coffee.name)
    const coffee = await findOrCreateCoffee(extractedInfo.coffee, roaster.id)
    console.log('Coffee created/found:', coffee.id)
    
    // Step 3: Create bag
    console.log('Step 3: Creating bag')
    const bag = await createBagFromExtractedInfo(extractedInfo.bag, coffee.id, photoUrl)
    console.log('Bag created:', bag.id)
    
    return {
      success: true,
      data: bag
    }
  } catch (error) {
    console.error('Error processing bag from photo:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}