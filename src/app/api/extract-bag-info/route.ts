import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Determine if we should use mock mode (no OpenAI API key configured)
const MOCK_MODE = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here'

// Initialize OpenAI client only if API key is available
const openai = MOCK_MODE ? null : new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

/**
 * Interface for comprehensive coffee bag information extracted from images
 * Includes roaster details, coffee characteristics, and bag specifications
 */
interface ExtractedBagInfo {
  /** Roaster information and background */
  roaster: {
    /** Roaster name as shown on the bag */
    name: string
    /** Country where the roaster is based */
    country?: string
    /** Roaster's website URL */
    website?: string
    /** Brief description of the roaster's background and reputation */
    description?: string
    /** Year the roastery was founded */
    founded_year?: number
    /** Roaster's specialty or focus area */
    specialty?: string
    /** Size category (Micro/Small/Medium/Large) */
    size_category?: string
    /** Typical roasting style approach */
    roasting_style?: string
  }
  /** Detailed coffee origin and characteristics */
  coffee: {
    /** Coffee name or blend name */
    name: string
    /** Country of origin */
    origin_country?: string
    /** Growing region within the country */
    region?: string
    /** More specific subregion */
    subregion?: string
    /** Specific farm or estate name */
    farm?: string
    /** Producer or farmer name */
    producer?: string
    /** Cooperative name if applicable */
    cooperative?: string
    /** Coffee variety/cultivar */
    variety?: string
    /** Detailed variety information */
    variety_details?: string
    /** Processing method (washed, natural, etc.) */
    process?: string
    /** Detailed process description */
    process_details?: string
    /** Growing altitude in meters */
    altitude?: number
    /** Altitude range if available */
    altitude_range?: string
    /** Typical harvest season for the region */
    harvest_season?: string
    /** Certifications (Organic, Fair Trade, etc.) */
    certification?: string
    /** SCA cupping score if mentioned */
    cupping_score?: number
    /** Flavor notes and tasting descriptors */
    tasting_notes?: string
    /** Structured flavor profile scoring */
    flavor_profile?: {
      /** Acidity level (1-10) */
      acidity?: number
      /** Body strength (1-10) */
      body?: number
      /** Sweetness level (1-10) */
      sweetness?: number
      /** Aroma intensity (1-10) */
      aroma?: number
      /** Overall balance (1-10) */
      balance?: number
      /** Aftertaste quality (1-10) */
      aftertaste?: number
      /** Array of flavor descriptors */
      notes?: string[]
    }
    /** Background story about the farm/region/processing */
    coffee_story?: string
  }
  /** Physical bag specifications */
  bag: {
    /** Bag size in grams */
    size_g: number
    /** Roast date if visible on bag */
    roast_date?: string
    /** Price if visible */
    price?: number
    /** Inferred purchase location */
    purchase_location?: string
  }
  /** Overall confidence in the extraction (0-1) */
  confidence: number
}

/**
 * POST /api/extract-bag-info
 * 
 * Extracts comprehensive information from coffee bag photos using OpenAI's GPT-4 Vision API.
 * Analyzes bag images to identify roaster details, coffee characteristics, origin information,
 * and bag specifications. Uses AI knowledge base to enrich data with additional context.
 * 
 * @param request - NextRequest containing multipart form data with:
 *   - image: File - The coffee bag photo to analyze
 * 
 * @returns NextResponse with ExtractedBagInfo object containing:
 *   - roaster: Detailed roaster information and background
 *   - coffee: Origin, processing, and flavor characteristics
 *   - bag: Physical specifications and purchase details
 *   - confidence: Confidence score for the extraction
 * 
 * Features:
 * - Identifies roaster name, location, and background
 * - Extracts coffee origin, variety, and processing details
 * - Provides flavor profiles and tasting notes
 * - Estimates bag specifications (size, roast date, price)
 * - Falls back to comprehensive mock data when API unavailable
 * 
 * The API leverages AI's extensive coffee knowledge to fill in details
 * even when not all information is visible on the bag.
 */
export async function POST(request: NextRequest) {
  try {
    // Extract the uploaded image file from form data
    const formData = await request.formData()
    const file = formData.get('image') as File

    // Validate that an image file was provided
    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    if (MOCK_MODE) {
      // Return comprehensive mock data for development when OpenAI API is not configured
      // This allows development and testing without requiring API access
      const mockData: ExtractedBagInfo = {
        roaster: {
          name: "Blue Bottle Coffee",
          country: "United States",
          website: "https://bluebottlecoffee.com",
          description: "Blue Bottle Coffee is an American specialty coffee roaster and retailer headquartered in Oakland, California. Known for their meticulous approach to sourcing, roasting, and brewing, they focus on freshness and quality, with a commitment to serving coffee within 48 hours of roasting.",
          founded_year: 2002,
          specialty: "Third Wave Specialty Coffee",
          size_category: "Large",
          roasting_style: "Light to Medium"
        },
        coffee: {
          name: "Giant Steps",
          origin_country: "Ethiopia",
          region: "Sidama",
          subregion: "Bensa",
          farm: "Bensa Washing Station",
          producer: "Local Smallholder Farmers",
          cooperative: "Bensa Farmers Cooperative",
          variety: "Heirloom Varieties",
          variety_details: "Traditional Ethiopian heirloom varieties including Typica and Bourbon cultivars, naturally adapted to the local terroir over centuries",
          process: "Washed",
          process_details: "Fully washed process with 24-48 hour fermentation in concrete tanks, followed by sun-drying on raised beds for 10-15 days",
          altitude: 1900,
          altitude_range: "1800-2000m",
          harvest_season: "October-February",
          certification: "Organic, Fair Trade",
          cupping_score: 86.5,
          tasting_notes: "Blueberry, dark chocolate, bright citrus acidity, floral aroma, medium body with clean finish",
          flavor_profile: {
            "acidity": 8,
            "body": 6,
            "sweetness": 7,
            "aroma": 9,
            "balance": 8,
            "aftertaste": 7,
            "notes": ["blueberry", "chocolate", "citrus", "floral"]
          },
          coffee_story: "This coffee comes from smallholder farmers around the Bensa washing station in Sidama, where families have been growing coffee for generations. The high altitude and volcanic soil create ideal conditions for developing the complex flavors Ethiopia is famous for."
        },
        bag: {
          size_g: 340,
          roast_date: "2024-02-15",
          price: 18.50,
          purchase_location: "Blue Bottle Coffee - Hayes Valley"
        },
        confidence: 0.85
      }

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000))

      return NextResponse.json(mockData)
    }

    // Convert file to base64 for OpenAI
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    const response = await openai!.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this coffee bag image and extract comprehensive information. Use your knowledge about coffee roasters, regions, and processes to enrich the data. Return JSON format:

{
  "roaster": {
    "name": "roaster name from bag",
    "country": "roaster's country",
    "website": "website if visible or known",
    "description": "brief description of the roaster's background and reputation",
    "founded_year": "year founded if known",
    "specialty": "specialty (e.g. 'Third Wave', 'Single Origin', etc.)",
    "size_category": "Micro/Small/Medium/Large based on your knowledge",
    "roasting_style": "typical roasting style (Light/Medium/Dark/Nordic)"
  },
  "coffee": {
    "name": "coffee name/blend name",
    "origin_country": "origin country",
    "region": "region/area",
    "subregion": "more specific subregion if known",
    "farm": "farm/washing station name",
    "producer": "producer/farmer name if available",
    "cooperative": "cooperative name if applicable",
    "variety": "coffee variety",
    "variety_details": "detailed variety information",
    "process": "processing method",
    "process_details": "detailed process description",
    "altitude": "altitude in meters",
    "altitude_range": "altitude range if available (e.g. '1200-1400m')",
    "harvest_season": "typical harvest season for this region",
    "certification": "certifications (Organic, Fair Trade, etc.)",
    "cupping_score": "SCA cupping score if mentioned",
    "tasting_notes": "detailed flavor notes",
    "flavor_profile": {
      "acidity": "score 1-10",
      "body": "score 1-10", 
      "sweetness": "score 1-10",
      "aroma": "score 1-10",
      "balance": "score 1-10",
      "aftertaste": "score 1-10",
      "notes": ["array", "of", "flavor", "descriptors"]
    },
    "coffee_story": "background story about the farm/region/processing"
  },
  "bag": {
    "size_g": "weight in grams",
    "roast_date": "roast date YYYY-MM-DD if visible",
    "price": "price if visible",
    "purchase_location": "store/location if inferrable from roaster"
  },
  "confidence": "confidence score 0-1"
}

Use your extensive coffee knowledge to fill in details even if not all info is visible on the bag. For well-known roasters and origins, provide comprehensive background information. Return only valid JSON.`
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    let extractedInfo: ExtractedBagInfo
    try {
      extractedInfo = JSON.parse(content)
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        extractedInfo = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Could not parse JSON from response')
      }
    }

    return NextResponse.json(extractedInfo)

  } catch (error) {
    console.error('Error extracting bag info:', error)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    )
  }
}