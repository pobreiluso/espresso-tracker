'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import AddBagFromPhoto from '@/components/AddBagFromPhoto'
import { getDashboardStats, getOpenBags, getRecentBrews } from '@/lib/queries'
import { useAuth } from '@/lib/auth-context'
import { BagWithCoffeeAndRoaster, BrewWithBagAndCoffee } from '@/types'
import { Coffee, Calendar, Star } from 'lucide-react'

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
          <div className="animate-spin h-8 w-8 border-2 border-peach border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Dashboard</h1>
          <p className="text-subtext1">Track your specialty coffee journey</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="text-2xl font-bold text-peach">{stats.openBags}</div>
            <div className="text-sm text-subtext1">Bolsas Abiertas</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-green">{stats.totalBrews}</div>
            <div className="text-sm text-subtext1">Total Cafés</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-yellow">
              {stats.avgRating ? stats.avgRating.toFixed(1) : '-'}
            </div>
            <div className="text-sm text-subtext1">Rating Medio</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-mauve">{stats.weeklyBrews}</div>
            <div className="text-sm text-subtext1">Esta Semana</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
            <div className="space-y-3">
              <AddBagFromPhoto />
              <button 
                onClick={() => (document.querySelector('[aria-label="Análisis de Extracción"]') as HTMLButtonElement)?.click()}
                className="btn btn-secondary w-full inline-flex items-center justify-center"
              >
                + Nuevo Análisis
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Bolsas Abiertas</h2>
            {openBags.length === 0 ? (
              <div className="text-center py-8">
                <Coffee className="h-12 w-12 text-subtext0 mx-auto mb-4" />
                <p className="text-subtext1">Sin bolsas abiertas</p>
                <p className="text-sm text-subtext0 mt-2">
                  Toma una foto de tu primera bolsa para empezar
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
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Cafés Recientes</h2>
            <Link href="/brews" className="text-sm text-peach hover:text-rosewater transition-colors">
              Ver todos →
            </Link>
          </div>
          
          {recentBrews.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-subtext0 mx-auto mb-4" />
              <p className="text-subtext1">Sin cafés aún</p>
              <p className="text-sm text-subtext0 mt-2">
                Comienza a hacer y trackear tus sesiones
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