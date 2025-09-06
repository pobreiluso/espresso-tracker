/**
 * Coffee name matching utilities for deduplication
 */

/**
 * Normalize coffee name for matching
 * Removes common variations and normalizes order
 */
export function normalizeCoffeeName(name: string): string {
  if (!name) return ''
  
  // Convert to lowercase and remove extra spaces
  let normalized = name.toLowerCase().trim().replace(/\s+/g, ' ')
  
  // Remove common variations
  normalized = normalized
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/\b(coffee|café|espresso)\b/g, '') // Remove coffee-related words
    .replace(/\b(roasted?|beans?)\b/g, '') // Remove roasting-related words
    .replace(/\s+/g, ' ')
    .trim()
  
  return normalized
}

/**
 * Extract key terms from coffee name for fuzzy matching
 */
export function extractCoffeeTerms(name: string): Set<string> {
  const normalized = normalizeCoffeeName(name)
  const words = normalized.split(' ').filter(word => word.length > 2)
  
  return new Set(words)
}

/**
 * Calculate similarity score between two coffee names
 * Returns a score between 0 and 1, where 1 is identical
 */
export function calculateCoffeeSimilarity(name1: string, name2: string): number {
  const terms1 = extractCoffeeTerms(name1)
  const terms2 = extractCoffeeTerms(name2)
  
  if (terms1.size === 0 || terms2.size === 0) return 0
  
  // Calculate Jaccard similarity
  const intersection = new Set([...terms1].filter(term => terms2.has(term)))
  const union = new Set([...terms1, ...terms2])
  
  const jaccardScore = intersection.size / union.size
  
  // Bonus for exact substring matches
  const norm1 = normalizeCoffeeName(name1)
  const norm2 = normalizeCoffeeName(name2)
  
  let substringBonus = 0
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    substringBonus = 0.2
  }
  
  // Check for common coffee origin patterns
  const originWords = ['honduras', 'el salvador', 'ethiopia', 'kenya', 'colombia', 'brazil', 'guatemala', 'costa rica']
  const processWords = ['honey', 'washed', 'natural', 'anaerobic', 'fermented']
  
  let patternBonus = 0
  const allWords1 = norm1.split(' ')
  const allWords2 = norm2.split(' ')
  
  // Check for matching origin
  const hasMatchingOrigin = originWords.some(origin => 
    allWords1.some(word => word.includes(origin)) && 
    allWords2.some(word => word.includes(origin))
  )
  
  // Check for matching process
  const hasMatchingProcess = processWords.some(process => 
    allWords1.some(word => word.includes(process)) && 
    allWords2.some(word => word.includes(process))
  )
  
  if (hasMatchingOrigin) patternBonus += 0.15
  if (hasMatchingProcess) patternBonus += 0.1
  
  return Math.min(1, jaccardScore + substringBonus + patternBonus)
}

/**
 * Check if two coffee names likely refer to the same coffee
 * Uses a threshold to determine if names are similar enough
 */
export function areCoffeesLikelySame(name1: string, name2: string, threshold = 0.7): boolean {
  const similarity = calculateCoffeeSimilarity(name1, name2)
  return similarity >= threshold
}

/**
 * Coffee record interface with distinctive characteristics
 */
interface CoffeeWithCharacteristics {
  id: string
  name: string
  origin_country?: string | null
  region?: string | null
  farm?: string | null
  process?: string | null
  variety?: string | null
  altitude?: number | null
}

/**
 * Calculate similarity based on distinctive characteristics
 */
export function calculateCharacteristicSimilarity(
  coffee1: Partial<CoffeeWithCharacteristics>, 
  coffee2: Partial<CoffeeWithCharacteristics>
): number {
  let score = 0
  let totalWeight = 0

  // Origin country (weight: 3)
  if (coffee1.origin_country && coffee2.origin_country) {
    totalWeight += 3
    if (coffee1.origin_country.toLowerCase() === coffee2.origin_country.toLowerCase()) {
      score += 3
    }
  }

  // Region (weight: 2.5)
  if (coffee1.region && coffee2.region) {
    totalWeight += 2.5
    if (coffee1.region.toLowerCase().includes(coffee2.region.toLowerCase()) ||
        coffee2.region.toLowerCase().includes(coffee1.region.toLowerCase())) {
      score += 2.5
    }
  }

  // Farm/Station (weight: 2)
  if (coffee1.farm && coffee2.farm) {
    totalWeight += 2
    if (coffee1.farm.toLowerCase().includes(coffee2.farm.toLowerCase()) ||
        coffee2.farm.toLowerCase().includes(coffee1.farm.toLowerCase())) {
      score += 2
    }
  }

  // Process (weight: 1.5)
  if (coffee1.process && coffee2.process) {
    totalWeight += 1.5
    if (coffee1.process.toLowerCase() === coffee2.process.toLowerCase()) {
      score += 1.5
    }
  }

  // Variety (weight: 1)
  if (coffee1.variety && coffee2.variety) {
    totalWeight += 1
    if (coffee1.variety.toLowerCase().includes(coffee2.variety.toLowerCase()) ||
        coffee2.variety.toLowerCase().includes(coffee1.variety.toLowerCase())) {
      score += 1
    }
  }

  // Return normalized score (0-1)
  return totalWeight > 0 ? score / totalWeight : 0
}

/**
 * Find the best matching coffee using distinctive characteristics
 */
export function findBestCoffeeMatchByCharacteristics(
  targetCoffee: Partial<CoffeeWithCharacteristics>,
  candidates: Array<CoffeeWithCharacteristics>,
  threshold = 0.8
): {coffee: CoffeeWithCharacteristics, score: number} | null {
  let bestMatch: {coffee: CoffeeWithCharacteristics, score: number} | null = null
  
  for (const candidate of candidates) {
    // Calculate characteristic similarity
    const charScore = calculateCharacteristicSimilarity(targetCoffee, candidate)
    
    // Fallback to name similarity if characteristics are insufficient
    const nameScore = calculateCoffeeSimilarity(targetCoffee.name || '', candidate.name)
    
    // Weighted combination: 70% characteristics, 30% name
    const finalScore = (charScore * 0.7) + (nameScore * 0.3)
    
    if (finalScore >= threshold && (bestMatch === null || finalScore > bestMatch.score)) {
      bestMatch = {
        coffee: candidate,
        score: finalScore
      }
    }
  }
  
  return bestMatch
}

/**
 * Find the best matching coffee from a list (legacy function for backward compatibility)
 */
export function findBestCoffeeMatch(
  targetName: string, 
  candidates: Array<{id: string, name: string}>,
  threshold = 0.7
): {id: string, name: string, score: number} | null {
  let bestMatch: {id: string, name: string, score: number} | null = null
  
  for (const candidate of candidates) {
    const score = calculateCoffeeSimilarity(targetName, candidate.name)
    
    if (score >= threshold && (bestMatch === null || score > bestMatch.score)) {
      bestMatch = {
        ...candidate,
        score
      }
    }
  }
  
  return bestMatch
}

// Test cases for development
export const coffeeMatchingTests = [
  {
    name1: 'El Salvador Honey La Hondurita',
    name2: 'Honey El Salvador La Hondurita',
    expected: true
  },
  {
    name1: 'Ethiopia Yirgacheffe Natural',
    name2: 'Natural Ethiopia Yirgacheffe',
    expected: true
  },
  {
    name1: 'Colombia Huila Washed',
    name2: 'Brazil Santos',
    expected: false
  },
  {
    name1: 'Kenya AA Kiambu',
    name2: 'Kenya AA Kiambu Washed',
    expected: true
  }
]