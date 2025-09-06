'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import AddBagFromPhoto from '@/components/AddBagFromPhoto'

export default function BagsPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleBagAdded = () => {
    setRefreshKey(prev => prev + 1)
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
          <button className="btn btn-secondary">
            All Bags
          </button>
          <button className="btn bg-surface1 text-subtext1">
            Open Only
          </button>
          <button className="btn bg-surface1 text-subtext1">
            Finished
          </button>
        </div>

        {/* Empty state */}
        <div className="card p-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📸</div>
            <h2 className="text-xl font-semibold mb-2">Start with a photo</h2>
            <p className="text-subtext1 mb-6">
              Simply take a photo of your coffee bag and our AI will extract all the details automatically - roaster, coffee name, origin, roast date, and more!
            </p>
            <div className="flex justify-center gap-4">
              <AddBagFromPhoto onSuccess={handleBagAdded} />
              <button className="btn btn-secondary">
                + Manual Entry
              </button>
            </div>
            <p className="text-xs text-subtext0 mt-4">
              For development: Uses mock data when OpenAI API key is not configured
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}