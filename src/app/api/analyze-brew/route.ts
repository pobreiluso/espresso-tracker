import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    const brewDataString = formData.get('brew_data') as string

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Parse brew data if provided
    let brewData = null
    if (brewDataString) {
      try {
        brewData = JSON.parse(brewDataString)
      } catch (e) {
        console.error('Failed to parse brew data:', e)
      }
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const imageUrl = `data:${image.type};base64,${base64}`

    // Call OpenAI Vision API to analyze the brewed coffee
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this photo of brewed coffee and provide detailed extraction analysis.${brewData ? `

**BREW PARAMETERS PROVIDED:**
${brewData.grind_setting ? `• Grind Setting: ${brewData.grind_setting}` : ''}
${brewData.extraction_time ? `• Extraction Time: ${brewData.extraction_time} seconds` : ''}
${brewData.dose_grams ? `• Coffee Dose: ${brewData.dose_grams}g` : ''}
${brewData.yield_grams ? `• Yield: ${brewData.yield_grams}g` : ''}
${brewData.water_temp ? `• Water Temperature: ${brewData.water_temp}°C` : ''}
${brewData.ratio ? `• Brew Ratio: 1:${brewData.ratio.toFixed(1)}` : ''}

Use these parameters to provide more accurate and contextual analysis. Consider how the visual characteristics align with these brewing parameters and provide specific recommendations based on this data.` : ''}

Look at:

1. **Extraction Quality**: Analyze the color, clarity, and visual characteristics to determine if the coffee appears under-extracted, over-extracted, or properly extracted${brewData ? '. Consider the provided extraction time and grind setting in your assessment.' : ''}
2. **Brewing Method**: Identify the brewing method based on the cup, crema, clarity, and overall appearance
3. **Volume Estimation**: Estimate the volume of coffee in ml based on cup size and liquid level${brewData?.yield_grams ? ` (provided yield: ${brewData.yield_grams}g)` : ''}
4. **Crema Analysis** (for espresso): Analyze crema color, thickness, texture, and coverage
5. **Visual Defects**: Identify any visual issues like channeling, uneven extraction, or other problems
6. **Coffee Strength**: Estimate strength based on opacity and color${brewData?.ratio ? ` (brew ratio: 1:${brewData.ratio.toFixed(1)})` : ''}
7. **Overall Quality**: Rate the visual quality and provide specific recommendations${brewData ? ' that consider the provided brewing parameters' : ''}

${brewData ? `
**IMPORTANT**: In your recommendations, provide specific adjustments based on the current parameters:
- If extraction time was ${brewData.extraction_time ? `${brewData.extraction_time}s` : 'not provided'}, suggest specific time adjustments
- If grind setting was ${brewData.grind_setting ? `${brewData.grind_setting}` : 'not provided'}, suggest specific grind adjustments (e.g., "try setting 13 instead of ${brewData.grind_setting}")
- If ratio was ${brewData.ratio ? `1:${brewData.ratio.toFixed(1)}` : 'not provided'}, suggest specific dose/yield changes
- If water temp was ${brewData.water_temp ? `${brewData.water_temp}°C` : 'not provided'}, suggest temperature adjustments` : ''}

Return ONLY a valid JSON object with this exact structure:
{
  "extraction_analysis": {
    "quality": "under-extracted|properly-extracted|over-extracted",
    "confidence": 0.85,
    "strength": "light|medium|strong",
    "defects": ["channeling", "uneven extraction"] // array of issues found
  },
  "brewing_method": {
    "detected_method": "espresso|pour-over|french-press|aeropress|drip|other",
    "confidence": 0.9,
    "indicators": ["crema present", "small cup", "thick body"] // visual cues used
  },
  "volume_estimation": {
    "estimated_ml": 30,
    "confidence": 0.7,
    "cup_type": "espresso cup|coffee mug|glass|other"
  },
  "crema_analysis": {
    "present": true,
    "color": "golden|dark|light|absent",
    "thickness": "thin|medium|thick",
    "coverage": "full|partial|patchy|none",
    "quality_score": 8.5
  },
  "visual_characteristics": {
    "color": "#8B4513",
    "opacity": "transparent|translucent|opaque",
    "clarity": "clear|slightly cloudy|cloudy|muddy",
    "surface_appearance": "smooth|foamy|bubbly|oily"
  },
  "quality_assessment": {
    "overall_score": 7.8,
    "positive_aspects": ["good crema", "even color", "proper extraction"],
    "areas_for_improvement": ["could be slightly stronger", "grind finer"],
    "recommendations": [
      "Try grinding 1-2 clicks finer",
      "Aim for 25-30 second extraction time", 
      "Check water temperature (should be 93-96°C)"
    ]
  },
  "technical_analysis": {
    "extraction_indicators": {
      "sourness_risk": "low|medium|high",
      "bitterness_risk": "low|medium|high",
      "balance_assessment": "under|balanced|over"
    },
    "suggested_adjustments": {
      "grind_size": "finer|current|coarser",
      "dose_adjustment": "increase|maintain|decrease",
      "time_adjustment": "shorter|current|longer"
    }
  },
  "confidence_overall": 0.82
}`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.1,
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response, handling code blocks if present
    let analysisResult
    try {
      // Remove markdown code block formatting if present
      let cleanContent = content.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      analysisResult = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content)
      console.error('Parse error:', parseError)
      throw new Error('Invalid JSON response from AI analysis')
    }

    return NextResponse.json(analysisResult)

  } catch (error) {
    console.error('Error analyzing brew:', error)
    
    // Return mock data for development/testing
    const mockAnalysis = {
      extraction_analysis: {
        quality: "properly-extracted",
        confidence: 0.75,
        strength: "medium",
        defects: []
      },
      brewing_method: {
        detected_method: "espresso",
        confidence: 0.8,
        indicators: ["small cup", "crema present", "thick body"]
      },
      volume_estimation: {
        estimated_ml: 30,
        confidence: 0.7,
        cup_type: "espresso cup"
      },
      crema_analysis: {
        present: true,
        color: "golden",
        thickness: "medium",
        coverage: "full",
        quality_score: 8.0
      },
      visual_characteristics: {
        color: "#8B4513",
        opacity: "opaque",
        clarity: "clear",
        surface_appearance: "smooth"
      },
      quality_assessment: {
        overall_score: 7.5,
        positive_aspects: ["good crema", "even color", "proper extraction"],
        areas_for_improvement: ["could experiment with grind size"],
        recommendations: [
          "Current extraction looks good",
          "Try adjusting grind size for different flavor profiles",
          "Maintain current technique"
        ]
      },
      technical_analysis: {
        extraction_indicators: {
          sourness_risk: "low",
          bitterness_risk: "low",
          balance_assessment: "balanced"
        },
        suggested_adjustments: {
          grind_size: "current",
          dose_adjustment: "maintain",
          time_adjustment: "current"
        }
      },
      confidence_overall: 0.75,
      _mock: true,
      _error: error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json(mockAnalysis)
  }
}