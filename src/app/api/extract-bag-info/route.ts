import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { rateLimiter, validateFileUpload, getSecureErrorMessage } from '@/lib/security'

// For development without OpenAI API key
const MOCK_MODE = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here'

const openai = MOCK_MODE ? null : new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface ExtractedBagInfo {
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

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'anonymous'
    if (rateLimiter.isRateLimited(`extract-bag-${ip}`, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Validate file upload
    const validation = validateFileUpload(file)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    if (MOCK_MODE) {
      // Return mock data for development
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
      { error: getSecureErrorMessage(error) },
      { status: 500 }
    )
  }
}