'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import AddBagFromPhoto from '@/components/AddBagFromPhoto'
import BagCard from '@/components/BagCard'
import PullToRefresh from '@/components/PullToRefresh'
import { AddBrewWithAnalysis } from '@/components/AddBrewWithAnalysis'
import ManualBagEntry from '@/components/ManualBagEntry'
import { getBags, getOpenBags, getFinishedBags, markBagAsFinished, deleteBag } from '@/lib/queries'
import { useAuth } from '@/lib/auth-context'
import { Loader2, Plus, PenTool } from 'lucide-react'
import { LoadingBags } from '@/components/ui/CoffeeLoader'
import { Button } from '@/components/ui/Button'

type FilterType = 'all' | 'open' | 'finished'

export default function BagsPage() {
  const { user, loading: authLoading } = useAuth()
  const [bags, setBags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [refreshKey, setRefreshKey] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAddBrew, setShowAddBrew] = useState(false)
  const [selectedBagId, setSelectedBagId] = useState<string | null>(null)
  const [showManualEntry, setShowManualEntry] = useState(false)

  const fetchBags = async (isRefresh = false) => {
    // Don't fetch if user is not authenticated
    if (!user) {
      setLoading(false)
      setIsRefreshing(false)
      return
    }

    try {
      if (isRefresh) {
        setIsRefreshing(true)
      } else {
        setLoading(true)
      }
      
      let data
      
      switch (filter) {
        case 'open':
          data = await getOpenBags()
          break
        case 'finished':
          data = await getFinishedBags()
          break
        default:
          data = await getBags()
      }
      
      setBags(data)
    } catch (error) {
      console.error('Error fetching bags:', error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchBags(true)
  }

  useEffect(() => {
    // Only fetch bags when auth loading is complete and user is available
    if (!authLoading && user) {
      fetchBags()
    } else if (!authLoading && !user) {
      // Auth loading complete but no user - will be handled by ProtectedRoute
      setLoading(false)
    }
  }, [filter, refreshKey, authLoading, user])

  const handleBagAdded = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleMarkFinished = async (bagId: string) => {
    try {
      await markBagAsFinished(bagId)
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      console.error('Error marking bag as finished:', error)
    }
  }

  const handleDeleteBag = async (bagId: string) => {
    if (!confirm('Are you sure you want to delete this bag? This action cannot be undone.')) {
      return
    }

    try {
      await deleteBag(bagId)
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      console.error('Error deleting bag:', error)
    }
  }

  const handleNewBrew = (bagId: string) => {
    setSelectedBagId(bagId)
    setShowAddBrew(true)
  }

  const handleBrewAdded = () => {
    setShowAddBrew(false)
    setSelectedBagId(null)
    setRefreshKey(prev => prev + 1) // Refresh the bags list
  }

  const handleManualBagAdded = () => {
    setShowManualEntry(false)
    setRefreshKey(prev => prev + 1) // Refresh the bags list
  }

  return (
    <Layout>
      <PullToRefresh onRefresh={handleRefresh} isRefreshing={isRefreshing}>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text mb-2">Mi Colección ☕</h1>
              <p className="text-subtext1">Tus cafés especiales organizados</p>
            </div>
            <div className="hidden md:flex gap-2">
              <AddBagFromPhoto onSuccess={handleBagAdded} />
              <Button
                variant="secondary"
                size="md"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setShowManualEntry(true)}
              >
                ✍️ Manual
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button 
              onClick={() => setFilter('all')}
              className={`btn ${filter === 'all' ? 'btn-primary' : 'bg-surface1 text-subtext1'} whitespace-nowrap h-10 px-4 text-sm`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilter('open')}
              className={`btn ${filter === 'open' ? 'btn-primary' : 'bg-surface1 text-subtext1'} whitespace-nowrap h-10 px-4 text-sm`}
            >
              Abiertos
            </button>
            <button 
              onClick={() => setFilter('finished')}
              className={`btn ${filter === 'finished' ? 'btn-primary' : 'bg-surface1 text-subtext1'} whitespace-nowrap h-10 px-4 text-sm`}
            >
              Terminados
            </button>
          </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <LoadingBags />
          </div>
        )}

        {/* Bags list */}
        {!loading && bags.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bags.map((bag) => (
              <BagCard 
                key={bag.id} 
                bag={bag} 
                onFinish={() => handleMarkFinished(bag.id)}
                onDelete={() => handleDeleteBag(bag.id)}
                onNewBrew={() => handleNewBrew(bag.id)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && bags.length === 0 && (
          <div className="card p-8">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {filter === 'all' ? '📸' : 
                 filter === 'open' ? '☕' : '✅'}
              </div>
              <h2 className="text-xl font-semibold mb-2">
                {filter === 'all' ? '¡Tu primer café te espera!' :
                 filter === 'open' ? 'No hay cafés listos para catar' :
                 'No has terminado ningún café'}
              </h2>
              <p className="text-subtext1 mb-6 text-sm leading-relaxed">
                {filter === 'all' ? 
                  'Captura cualquier bolsa de café especial y nuestra IA extraerá automáticamente el tostador, origen, notas de cata, fecha de tueste y todos los detalles que un cafetero necesita.' :
                 filter === 'open' ?
                  'Todos tus cafés están terminados. ¡Añade un nuevo café para empezar a hacer seguimiento!' :
                  'Aún no has terminado ningún café.'}
              </p>
              {(filter === 'all' || filter === 'open') && (
                <div className="flex justify-center gap-3 flex-wrap">
                  <div className="md:hidden">
                    <AddBagFromPhoto onSuccess={handleBagAdded} />
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => setShowManualEntry(true)}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    ✍️ Añadir Bolsa Manual
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </PullToRefresh>

      {/* Add Brew Modal */}
      {showAddBrew && selectedBagId && (
        <AddBrewWithAnalysis 
          onClose={() => setShowAddBrew(false)}
          onSuccess={handleBrewAdded}
          initialBagId={selectedBagId}
        />
      )}

      {/* Manual Bag Entry Modal */}
      {showManualEntry && (
        <ManualBagEntry
          onClose={() => setShowManualEntry(false)}
          onSuccess={handleManualBagAdded}
        />
      )}
    </Layout>
  )
}