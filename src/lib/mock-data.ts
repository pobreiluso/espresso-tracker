import { BrewAnalysis } from '@/types'

/**
 * Generate mock brew analysis data for development/testing
 */
export function createMockBrewAnalysis(errorMessage?: string): BrewAnalysis & { _mock: boolean; _error?: string } {
  return {
    extraction_analysis: {
      quality: "properly-extracted",
      confidence: 0.75,
      strength: "medium",
      defects: [],
      scientific_reasoning: "Mock analysis: Color and clarity suggest balanced extraction around 20-22% yield. Visual characteristics indicate proper grind size and technique."
    },
    brewing_method: {
      detected_method: "espresso",
      confidence: 0.8,
      indicators: ["small cup", "crema present", "thick body"],
      method_specific_notes: "Mock analysis: Good espresso characteristics with proper crema formation indicating fresh beans and correct extraction parameters."
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
      quality_score: 8.0,
      crema_science_notes: "Mock analysis: Good crema formation indicates proper extraction temperature and bean freshness."
    },
    visual_characteristics: {
      color: "#8B4513",
      opacity: "opaque",
      clarity: "clear",
      surface_appearance: "smooth",
      particle_analysis: "Mock analysis: Clean appearance with minimal visible particles indicating proper filtration."
    },
    quality_assessment: {
      overall_score: 7.5,
      positive_aspects: ["good crema formation", "even extraction", "proper color"],
      areas_for_improvement: ["could fine-tune grind consistency"],
      detailed_recommendations: [
        {
          recommendation: "Maintain current technique",
          scientific_reasoning: "Mock analysis: Current parameters show good extraction fundamentals",
          expected_flavor_impact: "Should maintain balanced flavor profile",
          priority: "low" as const
        }
      ],
      professional_notes: "Mock analysis: Solid extraction showing good barista fundamentals. Minor optimizations could enhance complexity."
    },
    technical_analysis: {
      extraction_indicators: {
        sourness_risk: "low",
        bitterness_risk: "low",
        balance_assessment: "balanced",
        tds_estimation: "1.3-1.5%",
        extraction_yield_estimate: "20-22%"
      },
      suggested_adjustments: {
        grind_size: "current",
        dose_adjustment: "maintain",
        time_adjustment: "current",
        temperature_adjustment: "maintain",
        technique_notes: "Mock analysis: Continue with current technique, focusing on consistency."
      },
      equipment_specific_advice: "Mock analysis: Equipment appears to be performing well. Regular calibration recommended."
    },
    professional_insights: {
      extraction_science_explanation: "Mock analysis: Visual characteristics suggest optimal extraction yield in the 20-22% range with good balance of acids, sugars, and aromatics.",
      flavor_prediction: "Expected profile: balanced acidity, medium body, sweet finish with developed flavor complexity.",
      brewing_mastery_tips: "Mock analysis: Focus on consistency and continue developing palate for subtle adjustments."
    },
    confidence_overall: 0.75,
    _mock: true,
    _error: errorMessage
  }
}