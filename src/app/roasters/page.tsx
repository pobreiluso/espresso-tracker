'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { getRoasters } from '@/lib/queries'
import { Loader2, Building, MapPin, Globe, Calendar } from 'lucide-react'

export default function RoastersPage() {
  const [roasters, setRoasters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRoasters = async () => {
      try {
        setLoading(true)
        const data = await getRoasters()
        setRoasters(data)
      } catch (error) {
        console.error('Error fetching roasters:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRoasters()
  }, [])

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Roasters</h1>
          <p className="text-subtext1">Browse all roasters in your collection</p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Roasters grid */}
        {!loading && roasters.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roasters.map((roaster) => (
              <div key={roaster.id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Building className="w-5 h-5 text-primary" />
                      {roaster.name}
                    </h3>
                    {roaster.specialty && (
                      <p className="text-sm text-primary font-medium">{roaster.specialty}</p>
                    )}
                  </div>
                  {roaster.size_category && (
                    <div className="px-2 py-1 bg-surface1 text-subtext1 text-xs rounded-full">
                      {roaster.size_category}
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {roaster.country && (
                    <div className="flex items-center gap-2 text-sm text-subtext1">
                      <MapPin className="w-4 h-4" />
                      <span>{roaster.country}</span>
                    </div>
                  )}
                  {roaster.founded_year && (
                    <div className="flex items-center gap-2 text-sm text-subtext1">
                      <Calendar className="w-4 h-4" />
                      <span>Founded {roaster.founded_year}</span>
                    </div>
                  )}
                  {roaster.website && (
                    <div className="flex items-center gap-2 text-sm text-subtext1">
                      <Globe className="w-4 h-4" />
                      <a 
                        href={roaster.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>

                {roaster.description && (
                  <div className="mb-4">
                    <p className="text-sm text-subtext1 line-clamp-3">
                      {roaster.description}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="btn btn-secondary flex-1 text-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && roasters.length === 0 && (
          <div className="card p-8">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏢</div>
              <h2 className="text-xl font-semibold mb-2">No roasters yet</h2>
              <p className="text-subtext1 mb-6">
                Add your first coffee bag to automatically create roasters from the bag information.
              </p>
              <button className="btn btn-primary">
                Add Coffee Bag
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}