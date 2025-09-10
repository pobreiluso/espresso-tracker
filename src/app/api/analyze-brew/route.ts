import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createMockBrewAnalysis } from '@/lib/mock-data'

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
          role: "system",
          content: `You are an expert coffee consultant with 15+ years of experience in specialty coffee, extraction science, and professional barista training. You have deep knowledge of:

• Coffee chemistry and extraction theory (TDS, extraction yield, Maillard reactions)
• Professional brewing methods and equipment calibration
• Sensory analysis and cupping standards (SCA protocols)
• Troubleshooting extraction problems through visual and taste analysis
• Regional coffee characteristics and processing methods
• Professional coffee shop operations and quality control

Your role is to analyze coffee photos with the precision and insight of a master barista, providing actionable, specific recommendations backed by coffee science principles. Always explain the "why" behind your recommendations using extraction theory and coffee chemistry.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this brewed coffee photo with professional precision. Provide detailed extraction analysis with specific, actionable recommendations backed by coffee science.

${brewData ? `**BREWING CONTEXT:**
${brewData.grind_setting ? `• Grind Setting: ${brewData.grind_setting}` : ''}
${brewData.extraction_time ? `• Extraction Time: ${brewData.extraction_time} seconds` : ''}
${brewData.dose_grams ? `• Coffee Dose: ${brewData.dose_grams}g` : ''}
${brewData.yield_grams ? `• Yield: ${brewData.yield_grams}g` : ''}
${brewData.water_temp ? `• Water Temperature: ${brewData.water_temp}°C` : ''}
${brewData.ratio ? `• Brew Ratio: 1:${brewData.ratio.toFixed(1)}` : ''}

CRITICAL: Use these parameters to provide context-specific analysis. Connect visual characteristics to brewing parameters and explain cause-effect relationships.

**COHERENCE CHECK:** Before making any recommendation, verify it makes sense with the current parameters:
- If current time is 30s, don't recommend "extend to 28-30s" - that makes no sense
- If current grind is 6, specify the exact new setting (e.g. "change to 4" for finer)
- Reference the ACTUAL current values in your reasoning` : ''}

**ANALYSIS REQUIREMENTS:**

1. **Professional Visual Assessment**
   - Analyze color saturation, clarity, surface tension, particle distribution
   - Identify brewing method from visual cues (cup type, crema, clarity, body)
   - Estimate extraction level using visual indicators (color depth, clarity, surface oil)
   
2. **Extraction Science Analysis**
   - Apply extraction theory to visual characteristics
   - Identify signs of under/over/proper extraction using color science
   - Analyze particle size distribution effects from visual clarity
   
3. **Method-Specific Evaluation**
   - For espresso: crema analysis (formation, color evolution, persistence, tiger striping)
   - For pour-over: clarity, brightness, particle visibility, brew bed analysis
   - For immersion: body, opacity, sediment, extraction evenness
   
4. **Professional Troubleshooting**
   - Identify specific extraction problems (channeling, uneven saturation, grind issues)
   - Connect visual defects to brewing parameter adjustments
   - Provide equipment-specific recommendations

**RECOMMENDATIONS MUST INCLUDE:**
- Specific parameter changes with scientific reasoning based on PROVIDED CURRENT VALUES
- Expected flavor impact of adjustments
- Progressive improvement steps (immediate vs. long-term changes)
- Equipment calibration suggestions when relevant

${brewData ? `**CRITICAL - CURRENT PARAMETER CONTEXT:**
Current extraction time: ${brewData.extraction_time}s - Only recommend time changes if visual analysis suggests this specific time is problematic
Current grind setting: ${brewData.grind_setting} - Recommend specific new setting numbers (e.g. "Change from ${brewData.grind_setting} to ${brewData.grind_setting && !isNaN(Number(brewData.grind_setting)) ? Number(brewData.grind_setting) + 2 : 'a finer setting'}")
Current ratio: ${brewData.ratio ? `1:${brewData.ratio.toFixed(1)}` : 'not provided'} - Only suggest changes if this specific ratio is causing extraction issues
DO NOT recommend maintaining current parameters if they are already at the suggested values.` : ''}

Return ONLY a valid JSON object with this exact structure:
{
  "extraction_analysis": {
    "quality": "under-extracted|properly-extracted|over-extracted",
    "confidence": 0.85,
    "strength": "light|medium|strong",
    "defects": ["channeling", "uneven extraction"],
    "scientific_reasoning": "The coffee's amber-golden color indicates proper extraction around 20-22% yield. Surface clarity suggests even particle distribution without significant channeling. Color saturation aligns with optimal extraction window for medium roast profiles."
  },
  "brewing_method": {
    "detected_method": "espresso|pour-over|french-press|aeropress|drip|other",
    "confidence": 0.9,
    "indicators": ["crema present", "small cup", "thick body"],
    "method_specific_notes": "Crema formation and retention indicates proper espresso extraction with good CO2 release from freshly roasted beans."
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
    "quality_score": 8.5,
    "crema_science_notes": "Golden-brown crema indicates proper extraction temperature and fresh beans. Thickness suggests optimal grind size and tamping pressure."
  },
  "visual_characteristics": {
    "color": "#8B4513",
    "opacity": "transparent|translucent|opaque",
    "clarity": "clear|slightly cloudy|cloudy|muddy",
    "surface_appearance": "smooth|foamy|bubbly|oily",
    "particle_analysis": "Minimal visible particles indicate proper filtration and grind size distribution."
  },
  "quality_assessment": {
    "overall_score": 7.8,
    "positive_aspects": ["good crema formation", "even color distribution", "proper extraction clarity"],
    "areas_for_improvement": ["could optimize grind consistency", "consider temperature profiling"],
    "detailed_recommendations": [
      {
        "recommendation": "Increase grind fineness by 2 clicks",
        "scientific_reasoning": "Current particle size appears slightly too coarse based on flow rate and color saturation. Finer grind will increase surface area and extraction yield.",
        "expected_flavor_impact": "Will reduce sourness and increase body and sweetness",
        "priority": "high"
      },
      {
        "recommendation": "Extend extraction time to 28-30 seconds",
        "scientific_reasoning": "Current extraction appears rushed. Longer contact time will improve soluble extraction and balance.",
        "expected_flavor_impact": "Better balance, reduced acidity, more developed flavor notes",
        "priority": "medium"
      }
    ],
    "professional_notes": "This extraction shows good fundamentals but has room for optimization in particle distribution and contact time."
  },
  "technical_analysis": {
    "extraction_indicators": {
      "sourness_risk": "medium",
      "bitterness_risk": "low",
      "balance_assessment": "slightly under",
      "tds_estimation": "1.2-1.4%",
      "extraction_yield_estimate": "19-21%"
    },
    "suggested_adjustments": {
      "grind_size": "finer",
      "dose_adjustment": "maintain",
      "time_adjustment": "longer",
      "temperature_adjustment": "maintain|increase|decrease",
      "technique_notes": "Focus on even tamping and consistent water distribution to improve extraction uniformity."
    },
    "equipment_specific_advice": "Consider burr grinder calibration for more consistent particle distribution. Check group head temperature stability."
  },
  "professional_insights": {
    "extraction_science_explanation": "Based on visual analysis, this coffee exhibits characteristics of partial under-extraction with good potential. The color depth and surface characteristics suggest 19-21% extraction yield, which is below the optimal 20-22% range for most coffees.",
    "flavor_prediction": "Likely tasting notes: bright acidity, moderate body, some fruit notes but may lack sweetness and complexity due to under-extraction.",
    "brewing_mastery_tips": "Focus on grind consistency and distribution. Consider WDT (Weiss Distribution Technique) for more even extraction. This coffee has good potential with minor adjustments."
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
    
    const mockAnalysis = createMockBrewAnalysis(
      error instanceof Error ? error.message : 'Unknown error'
    )

    return NextResponse.json(mockAnalysis)
  }
}