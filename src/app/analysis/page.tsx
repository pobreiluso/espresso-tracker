'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { BrewWithBagAndCoffee, BrewAnalysis } from '@/types'
import { getBrewsWithAnalysis } from '@/lib/queries'
import { Camera, TrendingUp, Coffee, Star, Clock, Settings, Droplets, Thermometer } from 'lucide-react'

export default function AnalysisPage() {
  const [brews, setBrews] = useState<BrewWithBagAndCoffee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalysisData()
  }, [])

  const fetchAnalysisData = async () => {
    try {
      setLoading(true)
      const data = await getBrewsWithAnalysis()
      setBrews(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading analysis data')
    } finally {
      setLoading(false)
    }
  }

  const getExtractionColor = (quality: string) => {
    switch (quality) {
      case 'properly-extracted': return 'text-green bg-green/20'
      case 'over-extracted': return 'text-red bg-red/20'
      case 'under-extracted': return 'text-yellow bg-yellow/20'
      default: return 'text-subtext0 bg-surface0'
    }
  }

  const getExtractionText = (quality: string) => {
    switch (quality) {
      case 'properly-extracted': return 'Óptima'
      case 'over-extracted': return 'Sobre-extraída'
      case 'under-extracted': return 'Sub-extraída'
      default: return 'Sin análisis'
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin h-8 w-8 border-2 border-peach border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-red">{error}</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-peach" />
              Análisis de Extracción
            </h1>
            <p className="text-subtext1 mt-1">
              Insights de IA sobre la calidad de tus extracciones
            </p>
          </div>
        </div>

        {brews.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="h-12 w-12 text-subtext0 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text mb-2">Sin Análisis Aún</h3>
            <p className="text-subtext1 mb-4">
              Usa el botón flotante con cámara para analizar tu próximo café
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card p-4">
                <div className="text-2xl font-bold text-peach">
                  {brews.filter(b => b.extraction_quality === 'properly-extracted').length}
                </div>
                <div className="text-sm text-subtext1">Extracciones Óptimas</div>
              </div>
              <div className="card p-4">
                <div className="text-2xl font-bold text-green">
                  {Math.round((brews.reduce((acc, b) => acc + (b.visual_score || 0), 0) / brews.length) * 10) / 10}
                </div>
                <div className="text-sm text-subtext1">Puntuación Media</div>
              </div>
              <div className="card p-4">
                <div className="text-2xl font-bold text-blue">
                  {Math.round((brews.reduce((acc, b) => acc + ((b.confidence_score || 0) * 100), 0) / brews.length))}%
                </div>
                <div className="text-sm text-subtext1">Confianza IA</div>
              </div>
              <div className="card p-4">
                <div className="text-2xl font-bold text-mauve">
                  {brews.length}
                </div>
                <div className="text-sm text-subtext1">Total Analizados</div>
              </div>
            </div>

            {/* Brew Analysis List */}
            <div className="space-y-4">
              {brews.map((brew) => {
                const analysis = brew.ai_analysis as BrewAnalysis | null
                
                return (
                  <div key={brew.id} className="card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-text">
                          {brew.bag.coffee.roaster.name} - {brew.bag.coffee.name}
                        </h3>
                        <p className="text-subtext1 text-sm">
                          {brew.brew_date ? new Date(brew.brew_date).toLocaleDateString('es-ES') : 'Sin fecha'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getExtractionColor(brew.extraction_quality || '')}`}>
                          {getExtractionText(brew.extraction_quality || '')}
                        </span>
                        {brew.visual_score && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow" />
                            <span className="text-sm font-medium text-text">{brew.visual_score}/10</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Parameters */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-text flex items-center gap-2">
                          <Settings className="h-4 w-4 text-peach" />
                          Parámetros
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {brew.grind_setting && (
                            <div className="flex justify-between">
                              <span className="text-subtext1">Molino:</span>
                              <span className="text-text">{brew.grind_setting}</span>
                            </div>
                          )}
                          {brew.extraction_time_seconds && (
                            <div className="flex justify-between items-center">
                              <span className="text-subtext1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Tiempo:
                              </span>
                              <span className="text-text">{brew.extraction_time_seconds}s</span>
                            </div>
                          )}
                          {brew.dose_grams && (
                            <div className="flex justify-between">
                              <span className="text-subtext1">Dosis:</span>
                              <span className="text-text">{brew.dose_grams}g</span>
                            </div>
                          )}
                          {brew.yield_grams && (
                            <div className="flex justify-between items-center">
                              <span className="text-subtext1 flex items-center gap-1">
                                <Droplets className="h-3 w-3" />
                                Yield:
                              </span>
                              <span className="text-text">{brew.yield_grams}g</span>
                            </div>
                          )}
                          {brew.water_temp_celsius && (
                            <div className="flex justify-between items-center">
                              <span className="text-subtext1 flex items-center gap-1">
                                <Thermometer className="h-3 w-3" />
                                Temp:
                              </span>
                              <span className="text-text">{brew.water_temp_celsius}°C</span>
                            </div>
                          )}
                          {brew.estimated_volume_ml && (
                            <div className="flex justify-between">
                              <span className="text-subtext1">Volumen:</span>
                              <span className="text-text">{brew.estimated_volume_ml}ml</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* AI Analysis */}
                      {analysis && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-text flex items-center gap-2">
                            <Coffee className="h-4 w-4 text-peach" />
                            Análisis IA
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-subtext1">Método:</span>
                              <span className="text-text capitalize">{analysis.brewing_method.detected_method}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-subtext1">Fuerza:</span>
                              <span className="text-text capitalize">{analysis.extraction_analysis.strength}</span>
                            </div>
                            {analysis.crema_analysis.present && (
                              <div className="flex justify-between">
                                <span className="text-subtext1">Crema:</span>
                                <span className="text-text capitalize">
                                  {analysis.crema_analysis.color} • {analysis.crema_analysis.thickness}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-subtext1">Confianza:</span>
                              <span className="text-peach">{Math.round(analysis.confidence_overall * 100)}%</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Professional Analysis */}
                    {analysis && (
                      <div className="mt-6 space-y-4">
                        {/* Scientific Analysis Section */}
                        {analysis.extraction_analysis.scientific_reasoning && (
                          <div className="bg-surface1 rounded-lg p-4">
                            <h5 className="text-sm font-semibold text-blue mb-2 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Análisis Científico
                            </h5>
                            <p className="text-sm text-subtext1 leading-relaxed">
                              {analysis.extraction_analysis.scientific_reasoning}
                            </p>
                          </div>
                        )}

                        {/* Professional Insights */}
                        {analysis.professional_insights && (
                          <div className="grid md:grid-cols-2 gap-4">
                            {analysis.professional_insights.extraction_science_explanation && (
                              <div className="bg-surface0 rounded-lg p-4">
                                <h6 className="text-sm font-medium text-text mb-2">Explicación Técnica</h6>
                                <p className="text-xs text-subtext1 leading-relaxed">
                                  {analysis.professional_insights.extraction_science_explanation}
                                </p>
                              </div>
                            )}
                            {analysis.professional_insights.flavor_prediction && (
                              <div className="bg-surface0 rounded-lg p-4">
                                <h6 className="text-sm font-medium text-text mb-2">Predicción de Sabor</h6>
                                <p className="text-xs text-subtext1 leading-relaxed">
                                  {analysis.professional_insights.flavor_prediction}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Enhanced Recommendations */}
                        {analysis.quality_assessment.detailed_recommendations && analysis.quality_assessment.detailed_recommendations.length > 0 ? (
                          <div className="border-t border-surface0 pt-4">
                            <h5 className="text-sm font-semibold text-peach mb-3">Recomendaciones Profesionales:</h5>
                            <div className="space-y-3">
                              {analysis.quality_assessment.detailed_recommendations.map((rec, index) => (
                                <div key={index} className="bg-gradient-to-r from-surface0 to-surface1 rounded-lg p-4">
                                  <div className="flex items-start gap-3">
                                    <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                                      rec.priority === 'high' ? 'bg-red' : 
                                      rec.priority === 'medium' ? 'bg-yellow' : 'bg-green'
                                    }`} />
                                    <div className="flex-1">
                                      <div className="font-medium text-text text-sm mb-1">{rec.recommendation}</div>
                                      <div className="text-xs text-subtext1 mb-2 leading-relaxed">
                                        <strong>Por qué:</strong> {rec.scientific_reasoning}
                                      </div>
                                      <div className="text-xs text-peach">
                                        <strong>Impacto esperado:</strong> {rec.expected_flavor_impact}
                                      </div>
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded-full ${
                                      rec.priority === 'high' ? 'bg-red/20 text-red' : 
                                      rec.priority === 'medium' ? 'bg-yellow/20 text-yellow' : 'bg-green/20 text-green'
                                    }`}>
                                      {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Media' : 'Baja'}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : analysis.quality_assessment.recommendations && analysis.quality_assessment.recommendations.length > 0 && (
                          <div className="border-t border-surface0 pt-4">
                            <h5 className="text-sm font-medium text-text mb-2">Recomendaciones:</h5>
                            <ul className="space-y-1">
                              {analysis.quality_assessment.recommendations.slice(0, 2).map((rec, index) => (
                                <li key={index} className="text-xs text-subtext1 flex items-start gap-2">
                                  <span className="text-peach">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Professional Notes & Tips */}
                        {(analysis.quality_assessment.professional_notes || analysis.professional_insights?.brewing_mastery_tips) && (
                          <div className="bg-peach/10 border border-peach/20 rounded-lg p-4">
                            <h6 className="text-sm font-semibold text-peach mb-2">Notas del Especialista</h6>
                            {analysis.quality_assessment.professional_notes && (
                              <p className="text-xs text-subtext1 mb-2">
                                {analysis.quality_assessment.professional_notes}
                              </p>
                            )}
                            {analysis.professional_insights?.brewing_mastery_tips && (
                              <p className="text-xs text-subtext1">
                                <strong>Consejo de Maestría:</strong> {analysis.professional_insights.brewing_mastery_tips}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}