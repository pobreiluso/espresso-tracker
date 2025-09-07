'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import AddBagFromPhoto from '@/components/AddBagFromPhoto'
import { getDashboardStats, getOpenBags, getRecentBrews } from '@/lib/queries'
import { useAuth } from '@/lib/auth-context'
import { BagWithCoffeeAndRoaster, BrewWithBagAndCoffee } from '@/types'
import { Coffee, Calendar, Star } from 'lucide-react'
import { CoffeeLoader } from '@/components/ui/CoffeeLoader'

interface DashboardStats {
  openBags: number
  totalBrews: number
  avgRating: number | null
  weeklyBrews: number
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    openBags: 0,
    totalBrews: 0,
    avgRating: null,
    weeklyBrews: 0
  })
  const [openBags, setOpenBags] = useState<BagWithCoffeeAndRoaster[]>([])
  const [recentBrews, setRecentBrews] = useState<BrewWithBagAndCoffee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only fetch data when auth loading is complete and user is available
    if (!authLoading && user) {
      fetchDashboardData()
    } else if (!authLoading && !user) {
      // Auth loading complete but no user - will be handled by ProtectedRoute
      setLoading(false)
    }
  }, [authLoading, user])

  // Listen for bag added event from FAB
  useEffect(() => {
    const handleBagAdded = () => {
      if (user) {
        fetchDashboardData()
      }
    }

    window.addEventListener('bagAdded', handleBagAdded)
    return () => window.removeEventListener('bagAdded', handleBagAdded)
  }, [user])

  const fetchDashboardData = async () => {
    // Don't fetch if user is not authenticated
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const [statsData, bagsData, brewsData] = await Promise.all([
        getDashboardStats(),
        getOpenBags(),
        getRecentBrews(5)
      ])
      
      setStats(statsData)
      setOpenBags(bagsData)
      setRecentBrews(brewsData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <CoffeeLoader message="Preparando tu cafetería..." size="lg" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Mi Cafetería ☕</h1>
          <p className="text-subtext1">Tu ritual diario del café especial</p>
        </div>

        {/* Coffee Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📦</span>
              <div className="text-2xl font-bold text-peach">{stats.openBags}</div>
            </div>
            <div className="text-sm text-subtext1">Cafés Abiertos</div>
          </div>
          <div className="card p-4 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">☕</span>
              <div className="text-2xl font-bold text-green">{stats.totalBrews}</div>
            </div>
            <div className="text-sm text-subtext1">Extracciones</div>
          </div>
          <div className="card p-4 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">⭐</span>
              <div className="text-2xl font-bold text-yellow">
                {stats.avgRating ? stats.avgRating.toFixed(1) : '-'}
              </div>
            </div>
            <div className="text-sm text-subtext1">Calidad Media</div>
          </div>
          <div className="card p-4 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📈</span>
              <div className="text-2xl font-bold text-mauve">{stats.weeklyBrews}</div>
            </div>
            <div className="text-sm text-subtext1">Esta Semana</div>
          </div>
        </div>

        {/* Coffee Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6 border-l-4 border-l-peach">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🚀</span>
              <h2 className="text-xl font-semibold">Acciones Rápidas</h2>
            </div>
            <div className="space-y-3">
              <AddBagFromPhoto />
              <button 
                onClick={() => (document.querySelector('[aria-label="Análisis de Extracción"]') as HTMLButtonElement)?.click()}
                className="btn btn-secondary w-full inline-flex items-center justify-center"
              >
                🔬 Analizar Extracción
              </button>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-l-green">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🫘</span>
              <h2 className="text-xl font-semibold">Cafés Abiertos</h2>
            </div>
            {openBags.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📸</div>
                <p className="text-subtext1 font-medium">¡Hora del primer café!</p>
                <p className="text-sm text-subtext0 mt-2 leading-relaxed">
                  Captura tu bolsa de café especial<br/>y comienza tu ritual de cata
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {openBags.slice(0, 3).map((bag) => (
                  <div key={bag.id} className="flex items-center justify-between p-3 bg-surface0 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">
                        {bag.coffee.name}
                      </p>
                      <p className="text-xs text-subtext1 truncate">
                        {bag.coffee.roaster.name}
                      </p>
                    </div>
                    <div className="text-xs text-subtext0 ml-2">
                      {bag.size_g}g
                    </div>
                  </div>
                ))}
                {openBags.length > 3 && (
                  <Link href="/bags" className="text-sm text-peach hover:text-rosewater transition-colors">
                    Ver todas las bolsas →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Brews */}
        <div className="card p-6 border-l-4 border-l-yellow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🍃</span>
              <h2 className="text-xl font-semibold">Últimas Extracciones</h2>
            </div>
            <Link href="/brews" className="text-sm text-peach hover:text-rosewater transition-colors font-medium">
              Ver historial →
            </Link>
          </div>
          
          {recentBrews.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">⏰</div>
              <p className="text-subtext1 font-medium">¡Primera extracción pendiente!</p>
              <p className="text-sm text-subtext0 mt-2 leading-relaxed">
                Prepara tu primera taza y registra<br/>los secretos de una extracción perfecta
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBrews.map((brew) => (
                <div key={brew.id} className="flex items-center justify-between p-3 bg-surface0 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {brew.bag.coffee.roaster.name} - {brew.bag.coffee.name}
                    </p>
                    <p className="text-xs text-subtext1">
                      {brew.brew_date ? new Date(brew.brew_date).toLocaleDateString('es-ES') : 'Sin fecha'} • {brew.method}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Star className="h-3 w-3 text-yellow fill-current" />
                    <span className="text-xs text-text">{brew.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}