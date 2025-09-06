'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { BrewWithBagAndCoffee } from '@/types'
import { 
  Star, Coffee, Clock, Thermometer, Scale, Zap, Calendar, Eye, 
  ArrowLeft, MapPin, Bean, Droplets, Timer, Activity, Camera,
  Award, TrendingUp, AlertCircle 
} from 'lucide-react'
import Image from 'next/image'

interface BrewDetailsPageProps {
  params: Promise<{ id: string }>
}

export default function BrewDetailsPage({ params }: BrewDetailsPageProps) {
  const [brew, setBrew] = useState<BrewWithBagAndCoffee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchBrew = async () => {
      try {
        const { id } = await params
        const { data, error: fetchError } = await supabase
          .from('brews')
          .select(`
            *,
            bag:bags (
              *,
              coffee:coffees (
                *,
                roaster:roasters (*)
              )
            )
          `)
          .eq('id', id)
          .single()

        if (fetchError) {
          throw fetchError
        }

        setBrew(data)
      } catch (err) {
        console.error('Error fetching brew:', err)
        setError(err instanceof Error ? err.message : 'Error loading brew details')
      } finally {
        setLoading(false)
      }
    }

    fetchBrew()
  }, [params])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sin fecha'
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      'espresso': 'bg-red/20 text-red border-red/30',
      'v60': 'bg-blue/20 text-blue border-blue/30',
      'aeropress': 'bg-green/20 text-green border-green/30',
      'chemex': 'bg-yellow/20 text-yellow border-yellow/30',
      'kalita': 'bg-purple/20 text-purple border-purple/30',
      'frenchpress': 'bg-orange/20 text-orange border-orange/30'
    }
    return colors[method] || 'bg-gray/20 text-gray border-gray/30'
  }

  const getExtractionQualityColor = (quality: string | null | undefined) => {
    if (!quality) return 'bg-gray/20 text-gray border-gray/30'
    
    const colors: Record<string, string> = {
      'properly-extracted': 'bg-green/20 text-green border-green/30',
      'over-extracted': 'bg-red/20 text-red border-red/30',
      'under-extracted': 'bg-yellow/20 text-yellow border-yellow/30'
    }
    return colors[quality] || 'bg-gray/20 text-gray border-gray/30'
  }

  const getExtractionQualityText = (quality: string | null | undefined) => {
    if (!quality) return 'Sin análisis'
    
    const texts: Record<string, string> = {
      'properly-extracted': 'Óptima',
      'over-extracted': 'Sobre-extraída',
      'under-extracted': 'Sub-extraída'
    }
    return texts[quality] || quality
  }

  const getQualityIcon = (quality: string | null | undefined) => {
    if (!quality) return AlertCircle
    
    const icons: Record<string, any> = {
      'properly-extracted': Award,
      'over-extracted': TrendingUp,
      'under-extracted': Activity
    }
    return icons[quality] || AlertCircle
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

  if (error || !brew) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-text mb-4">Error</h1>
          <p className="text-subtext1 mb-6">{error || 'No se pudo encontrar el café'}</p>
          <button 
            onClick={() => router.back()}
            className="btn btn-primary"
          >
            Volver
          </button>
        </div>
      </Layout>
    )
  }

  const QualityIcon = getQualityIcon(brew.extraction_quality)

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-surface0 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-text mb-2">Detalles del Café</h1>
            <p className="text-subtext1">{formatDate(brew.brew_date)}</p>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 text-yellow fill-current" />
            <span className="text-lg font-medium">{brew.rating}/10</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Coffee Info */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {brew.bag.coffee.roaster.name} - {brew.bag.coffee.name}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getMethodColor(brew.method)}`}>
                      {brew.method.toUpperCase()}
                    </span>
                    {brew.has_ai_analysis && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getExtractionQualityColor(brew.extraction_quality)}`}>
                        <QualityIcon className="h-4 w-4 inline mr-1" />
                        {getExtractionQualityText(brew.extraction_quality)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Coffee Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {brew.bag.coffee.origin_country && (
                  <div className="flex items-center gap-2 text-subtext1">
                    <MapPin className="h-4 w-4" />
                    <span>{brew.bag.coffee.origin_country}</span>
                  </div>
                )}
                {brew.bag.coffee.region && (
                  <div className="flex items-center gap-2 text-subtext1">
                    <MapPin className="h-4 w-4" />
                    <span>{brew.bag.coffee.region}</span>
                  </div>
                )}
                {brew.bag.coffee.process && (
                  <div className="flex items-center gap-2 text-subtext1">
                    <Droplets className="h-4 w-4" />
                    <span>{brew.bag.coffee.process}</span>
                  </div>
                )}
              </div>

              {/* Brew Parameters */}
              <div className="border-t border-overlay0 pt-6">
                <h3 className="font-semibold mb-4 text-subtext0 uppercase tracking-wide text-sm">Parámetros de Preparación</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <Scale className="h-6 w-6 text-blue mx-auto mb-2" />
                    <div className="text-sm text-subtext1">Dosis</div>
                    <div className="font-semibold">{brew.dose_g}g</div>
                  </div>
                  <div className="text-center">
                    <Coffee className="h-6 w-6 text-peach mx-auto mb-2" />
                    <div className="text-sm text-subtext1">Resultado</div>
                    <div className="font-semibold">{brew.yield_g}g</div>
                  </div>
                  <div className="text-center">
                    <Clock className="h-6 w-6 text-green mx-auto mb-2" />
                    <div className="text-sm text-subtext1">Tiempo</div>
                    <div className="font-semibold">{brew.time_s}s</div>
                  </div>
                  <div className="text-center">
                    <Thermometer className="h-6 w-6 text-red mx-auto mb-2" />
                    <div className="text-sm text-subtext1">Temperatura</div>
                    <div className="font-semibold">{brew.water_temp_c}°C</div>
                  </div>
                </div>
              </div>

              {/* Additional Parameters */}
              <div className="border-t border-overlay0 pt-6 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-subtext1 mb-1">Molido</div>
                    <div className="font-medium">#{brew.grind_setting}</div>
                  </div>
                  <div>
                    <div className="text-sm text-subtext1 mb-1">Ratio</div>
                    <div className="font-medium">1:{(brew.yield_g / brew.dose_g).toFixed(1)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            {brew.has_ai_analysis && brew.ai_analysis && (
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Eye className="h-5 w-5 text-blue" />
                  <h3 className="text-lg font-semibold">Análisis IA</h3>
                  {brew.confidence_score && (
                    <span className="text-xs text-subtext1 bg-surface0 px-2 py-1 rounded">
                      Confianza: {Math.round(brew.confidence_score * 100)}%
                    </span>
                  )}
                </div>

                {/* Visual Score */}
                {brew.visual_score && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Puntuación Visual</span>
                      <span className="font-bold text-lg">{brew.visual_score}/10</span>
                    </div>
                    <div className="w-full bg-surface0 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue to-sapphire h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(brew.visual_score / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {brew.ai_analysis.quality_assessment?.recommendations && (
                  <div className="bg-surface0 rounded-lg p-4">
                    <h4 className="font-medium mb-3 text-blue">Recomendaciones</h4>
                    <div className="space-y-2 text-sm text-subtext1">
                      {Array.isArray(brew.ai_analysis.quality_assessment.recommendations) 
                        ? brew.ai_analysis.quality_assessment.recommendations.map((rec: string, index: number) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-blue rounded-full mt-2 flex-shrink-0" />
                              <span>{rec}</span>
                            </div>
                          ))
                        : <span>{brew.ai_analysis.quality_assessment.recommendations}</span>
                      }
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {brew.notes && (
              <div className="card p-6">
                <h3 className="font-semibold mb-4 text-subtext0 uppercase tracking-wide text-sm">Notas</h3>
                <p className="text-subtext1 leading-relaxed">{brew.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Photo */}
            {brew.photo_url && (
              <div className="card p-4">
                <h3 className="font-semibold mb-4 text-subtext0 uppercase tracking-wide text-sm">Foto</h3>
                <div className="aspect-square rounded-lg overflow-hidden bg-surface0">
                  <Image
                    src={brew.photo_url}
                    alt="Foto del café"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Bag Info */}
            <div className="card p-4">
              <h3 className="font-semibold mb-4 text-subtext0 uppercase tracking-wide text-sm">Información de la Bolsa</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-subtext1">Tamaño</span>
                  <span className="font-medium">{brew.bag.size_g}g</span>
                </div>
                {brew.bag.price && (
                  <div className="flex justify-between">
                    <span className="text-subtext1">Precio</span>
                    <span className="font-medium">€{brew.bag.price}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-subtext1">Fecha tueste</span>
                  <span className="font-medium">
                    {new Date(brew.bag.roast_date).toLocaleDateString('es-ES')}
                  </span>
                </div>
                {brew.bag.open_date && (
                  <div className="flex justify-between">
                    <span className="text-subtext1">Fecha apertura</span>
                    <span className="font-medium">
                      {new Date(brew.bag.open_date).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Coffee Details */}
            <div className="card p-4">
              <h3 className="font-semibold mb-4 text-subtext0 uppercase tracking-wide text-sm">Detalles del Café</h3>
              <div className="space-y-3 text-sm">
                {brew.bag.coffee.variety && (
                  <div className="flex justify-between">
                    <span className="text-subtext1">Variedad</span>
                    <span className="font-medium">{brew.bag.coffee.variety}</span>
                  </div>
                )}
                {brew.bag.coffee.altitude && (
                  <div className="flex justify-between">
                    <span className="text-subtext1">Altitud</span>
                    <span className="font-medium">{brew.bag.coffee.altitude}m</span>
                  </div>
                )}
                {brew.bag.coffee.cupping_score && (
                  <div className="flex justify-between">
                    <span className="text-subtext1">Cupping Score</span>
                    <span className="font-medium">{brew.bag.coffee.cupping_score}/100</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}