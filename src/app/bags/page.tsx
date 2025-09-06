'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import AddBagFromPhoto from '@/components/AddBagFromPhoto'
import BagCard from '@/components/BagCard'
import { getBags, getOpenBags, getFinishedBags, markBagAsFinished, deleteBag } from '@/lib/queries'
import { Loader2 } from 'lucide-react'

type FilterType = 'all' | 'open' | 'finished'

export default function BagsPage() {
  const [bags, setBags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchBags = async () => {
    try {
      setLoading(true)
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
    }
  }

  useEffect(() => {
    fetchBags()
  }, [filter, refreshKey])

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

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">Coffee Bags</h1>
            <p className="text-subtext1">Manage your coffee bag collection</p>
          </div>
          <div className="flex gap-2">
            <AddBagFromPhoto onSuccess={handleBagAdded} />
            <button className="btn btn-secondary">
              + Manual Entry
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <button 
            onClick={() => setFilter('all')}
            className={`btn ${filter === 'all' ? 'btn-primary' : 'bg-surface1 text-subtext1'}`}
          >
            All Bags
          </button>
          <button 
            onClick={() => setFilter('open')}
            className={`btn ${filter === 'open' ? 'btn-primary' : 'bg-surface1 text-subtext1'}`}
          >
            Open Only
          </button>
          <button 
            onClick={() => setFilter('finished')}
            className={`btn ${filter === 'finished' ? 'btn-primary' : 'bg-surface1 text-subtext1'}`}
          >
            Finished
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
                {filter === 'all' ? 'Start with a photo' :
                 filter === 'open' ? 'No open bags' :
                 'No finished bags'}
              </h2>
              <p className="text-subtext1 mb-6">
                {filter === 'all' ? 
                  'Simply take a photo of your coffee bag and our AI will extract all the details automatically - roaster, coffee name, origin, roast date, and more!' :
                 filter === 'open' ?
                  'All your bags are finished. Add a new bag to start tracking!' :
                  'No bags have been finished yet.'}
              </p>
              {(filter === 'all' || filter === 'open') && (
                <div className="flex justify-center gap-4">
                  <AddBagFromPhoto onSuccess={handleBagAdded} />
                  <button className="btn btn-secondary">
                    + Manual Entry
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}