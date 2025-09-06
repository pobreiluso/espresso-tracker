'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { getAllBrews } from '@/lib/queries'
import { BrewWithBagAndCoffee } from '@/types'
import { Star, Coffee, Clock, Thermometer, Scale, Zap, Calendar, Eye } from 'lucide-react'

export default function BrewsPage() {
  const [brews, setBrews] = useState<BrewWithBagAndCoffee[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    method: 'all',
    rating: 0,
    search: ''
  })
  const router = useRouter()

  useEffect(() => {
    fetchBrews()
  }, [filters])

  const fetchBrews = async () => {
    try {
      setLoading(true)
      const data = await getAllBrews(filters.method === 'all' ? undefined : filters)
      setBrews(data)
    } catch (error) {
      console.error('Error fetching brews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sin fecha'
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      'espresso': 'bg-red/20 text-red',
      'v60': 'bg-blue/20 text-blue',
      'aeropress': 'bg-green/20 text-green',
      'chemex': 'bg-yellow/20 text-yellow',
      'kalita': 'bg-purple/20 text-purple',
      'frenchpress': 'bg-orange/20 text-orange'
    }
    return colors[method] || 'bg-gray/20 text-gray'
  }

  const getExtractionQualityColor = (quality: string | null | undefined) => {
    if (!quality) return 'bg-gray/20 text-gray'
    
    const colors: Record<string, string> = {
      'properly-extracted': 'bg-green/20 text-green',
      'over-extracted': 'bg-red/20 text-red',
      'under-extracted': 'bg-yellow/20 text-yellow'
    }
    return colors[quality] || 'bg-gray/20 text-gray'
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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin h-8 w-8 border-2 border-peach border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">Cafés Preparados</h1>
            <p className="text-subtext1">Historial y análisis de tus sesiones de café</p>
          </div>
          <div className="text-sm text-subtext1">
            {brews.length} café{brews.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <select 
            className="input w-auto"
            value={filters.method}
            onChange={(e) => handleFilterChange('method', e.target.value)}
          >
            <option value="all">Todos los Métodos</option>
            <option value="espresso">Espresso</option>
            <option value="v60">V60</option>
            <option value="aeropress">AeroPress</option>
            <option value="chemex">Chemex</option>
            <option value="kalita">Kalita</option>
            <option value="frenchpress">Prensa Francesa</option>
          </select>
          <select 
            className="input w-auto"
            value={filters.rating}
            onChange={(e) => handleFilterChange('rating', Number(e.target.value))}
          >
            <option value={0}>Todas las Puntuaciones</option>
            <option value={8}>8+ Estrellas</option>
            <option value={6}>6+ Estrellas</option>
            <option value={4}>4+ Estrellas</option>
          </select>
          <input 
            type="search" 
            placeholder="Buscar en notas..." 
            className="input w-auto min-w-[200px]"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        {/* Brews List */}
        {brews.length === 0 ? (
          <div className="card p-8">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🫖</div>
              <h2 className="text-xl font-semibold mb-2">
                {filters.method !== 'all' || filters.rating > 0 || filters.search 
                  ? 'No se encontraron cafés' 
                  : 'Sin cafés aún'}
              </h2>
              <p className="text-subtext1 mb-6">
                {filters.method !== 'all' || filters.rating > 0 || filters.search
                  ? 'Intenta cambiar los filtros para ver más resultados'
                  : 'Comienza a preparar y grabar tus sesiones para construir tu conocimiento cafetero'}
              </p>
              {filters.method === 'all' && filters.rating === 0 && !filters.search && (
                <button 
                  onClick={() => (document.querySelector('[aria-label="Análisis de Extracción"]') as HTMLElement)?.click()}
                  className="btn btn-primary"
                >
                  + Grabar Primer Café
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {brews.map((brew) => (
              <div 
                key={brew.id} 
                className="card p-6 cursor-pointer hover:bg-surface0 transition-colors"
                onClick={() => router.push(`/brews/${brew.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-text truncate">
                        {brew.bag.coffee.roaster.name} - {brew.bag.coffee.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(brew.method)}`}>
                        {brew.method.toUpperCase()}
                      </span>
                      {brew.has_ai_analysis && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExtractionQualityColor(brew.extraction_quality)}`}>
                          {getExtractionQualityText(brew.extraction_quality)}
                        </span>
                      )}
                    </div>
                    <p className="text-subtext1 text-sm">
                      {formatDate(brew.brew_date)} • {brew.bag.coffee.origin_country}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow fill-current" />
                    <span className="text-sm font-medium">{brew.rating}</span>
                  </div>
                </div>

                {/* Brew Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-subtext1">
                    <Scale className="h-4 w-4" />
                    <span>{brew.dose_g}g → {brew.yield_g}g</span>
                  </div>
                  <div className="flex items-center gap-2 text-subtext1">
                    <Clock className="h-4 w-4" />
                    <span>{brew.time_s}s</span>
                  </div>
                  <div className="flex items-center gap-2 text-subtext1">
                    <Thermometer className="h-4 w-4" />
                    <span>{brew.water_temp_c}°C</span>
                  </div>
                  <div className="flex items-center gap-2 text-subtext1">
                    <Coffee className="h-4 w-4" />
                    <span>#{brew.grind_setting}</span>
                  </div>
                </div>

                {/* AI Analysis Info */}
                {brew.has_ai_analysis && (
                  <div className="bg-surface0 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-blue" />
                      <span className="text-sm font-medium text-blue">Análisis IA</span>
                      {brew.visual_score && (
                        <span className="text-xs text-subtext1">
                          Puntuación visual: {brew.visual_score}/10
                        </span>
                      )}
                    </div>
                    {brew.ai_analysis?.quality_assessment?.recommendations && (
                      <div className="text-sm text-subtext1">
                        <strong>Recomendaciones:</strong> {Array.isArray(brew.ai_analysis.quality_assessment.recommendations) 
                          ? brew.ai_analysis.quality_assessment.recommendations.join('. ')
                          : brew.ai_analysis.quality_assessment.recommendations}
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {brew.notes && (
                  <div className="border-t border-overlay0 pt-4">
                    <h4 className="text-sm font-medium text-subtext0 mb-2">Notas</h4>
                    <p className="text-sm text-subtext1">{brew.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}