'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { getCoffees } from '@/lib/queries'
import { Loader2, Bean, MapPin, Mountain, Award, Leaf } from 'lucide-react'

export default function CoffeesPage() {
  const [coffees, setCoffees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCoffees = async () => {
      try {
        setLoading(true)
        const data = await getCoffees()
        setCoffees(data)
      } catch (error) {
        console.error('Error fetching coffees:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCoffees()
  }, [])

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Coffees</h1>
          <p className="text-subtext1">Browse all coffee varieties in your collection</p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Coffees grid */}
        {!loading && coffees.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {coffees.map((coffee) => (
              <div key={coffee.id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Bean className="w-5 h-5 text-primary" />
                      {coffee.name}
                    </h3>
                    <p className="text-subtext1 font-medium">{coffee.roaster.name}</p>
                    {coffee.origin_country && (
                      <p className="text-sm text-subtext0">
                        {coffee.origin_country}
                        {coffee.region && ` • ${coffee.region}`}
                      </p>
                    )}
                  </div>
                  {coffee.cupping_score && (
                    <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                      {coffee.cupping_score}pts
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {coffee.variety && (
                    <div className="flex items-center gap-2 text-sm text-subtext1">
                      <Leaf className="w-4 h-4" />
                      <span>{coffee.variety}</span>
                    </div>
                  )}
                  {coffee.process && (
                    <div className="flex items-center gap-2 text-sm text-subtext1">
                      <Award className="w-4 h-4" />
                      <span>{coffee.process}</span>
                    </div>
                  )}
                  {coffee.altitude && (
                    <div className="flex items-center gap-2 text-sm text-subtext1">
                      <Mountain className="w-4 h-4" />
                      <span>{coffee.altitude}m</span>
                    </div>
                  )}
                  {coffee.farm && (
                    <div className="flex items-center gap-2 text-sm text-subtext1">
                      <MapPin className="w-4 h-4" />
                      <span>{coffee.farm}</span>
                    </div>
                  )}
                </div>

                {coffee.tasting_notes && (
                  <div className="mb-4">
                    <p className="text-sm text-subtext1 line-clamp-2">
                      {coffee.tasting_notes}
                    </p>
                  </div>
                )}

                {coffee.certification && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {coffee.certification.split(',').map((cert: string, index: number) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-green/10 text-green text-xs rounded-full"
                        >
                          {cert.trim()}
                        </span>
                      ))}
                    </div>
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
        {!loading && coffees.length === 0 && (
          <div className="card p-8">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🫘</div>
              <h2 className="text-xl font-semibold mb-2">No coffees yet</h2>
              <p className="text-subtext1 mb-6">
                Add your first coffee bag to automatically create coffee varieties from the bag information.
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