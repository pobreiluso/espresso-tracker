'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal'
import { supabase } from '@/lib/supabase'
import { Trash2, Coffee, Building, Package, Search } from 'lucide-react'

interface Coffee {
  id: string
  name: string
  origin_country: string | null
  region: string | null
  farm: string | null
  process: string | null
  roaster: {
    id: string
    name: string
  }
}

interface Roaster {
  id: string
  name: string
  country: string | null
  specialty: string | null
  coffees: { count: number }[]
}

interface Bag {
  id: string
  size_g: number
  roast_date: string
  open_date: string | null
  finish_date: string | null
  coffee: {
    id: string
    name: string
    roaster: {
      name: string
    }
  }
}

export default function ManagePage() {
  const [activeTab, setActiveTab] = useState<'roasters' | 'coffees' | 'bags'>('roasters')
  const [roasters, setRoasters] = useState<Roaster[]>([])
  const [coffees, setCoffees] = useState<Coffee[]>([])
  const [bags, setBags] = useState<Bag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    type: 'roaster' | 'coffee' | 'bag'
    id: string
    name: string
  }>({
    isOpen: false,
    type: 'roaster',
    id: '',
    name: ''
  })

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'roasters') {
        const { data, error } = await supabase
          .from('roasters')
          .select(`
            id,
            name,
            country,
            specialty,
            coffees(count)
          `)
          .order('name')

        if (error) throw error
        setRoasters(data || [])
      } else if (activeTab === 'coffees') {
        const { data, error } = await supabase
          .from('coffees')
          .select(`
            id,
            name,
            origin_country,
            region,
            farm,
            process,
            roaster:roasters(
              id,
              name
            )
          `)
          .order('name')

        if (error) throw error
        setCoffees(data || [])
      } else if (activeTab === 'bags') {
        const { data, error } = await supabase
          .from('bags')
          .select(`
            id,
            size_g,
            roast_date,
            open_date,
            finish_date,
            coffee:coffees(
              id,
              name,
              roaster:roasters(
                name
              )
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error
        setBags(data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/${deleteModal.type}s/${deleteModal.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      
      if (result.success) {
        // Refresh the data
        await fetchData()
      } else {
        console.error('Delete failed:', result.error)
      }
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const openDeleteModal = (type: 'roaster' | 'coffee' | 'bag', id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      type,
      id,
      name
    })
  }

  const filteredRoasters = roasters.filter(roaster =>
    roaster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (roaster.country && roaster.country.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredCoffees = coffees.filter(coffee =>
    coffee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coffee.roaster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (coffee.origin_country && coffee.origin_country.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (coffee.region && coffee.region.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredBags = bags.filter(bag =>
    bag.coffee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bag.coffee.roaster.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Gestionar Datos</h1>
          <p className="text-subtext1">Administra tus tostadores, cafés y bolsas</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-surface0 p-1 rounded-lg">
          {[
            { key: 'roasters', label: 'Tostadores', icon: Building },
            { key: 'coffees', label: 'Cafés', icon: Coffee },
            { key: 'bags', label: 'Bolsas', icon: Package }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === key
                  ? 'bg-background text-text shadow-sm'
                  : 'text-subtext1 hover:text-text'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-subtext1" />
          <input
            type="text"
            placeholder={`Buscar ${activeTab === 'roasters' ? 'tostadores' : activeTab === 'coffees' ? 'cafés' : 'bolsas'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>

        {/* Content */}
        <div className="card">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-peach border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="divide-y divide-overlay0">
              {/* Roasters */}
              {activeTab === 'roasters' && filteredRoasters.map((roaster) => (
                <div key={roaster.id} className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Building className="w-4 h-4 text-subtext1" />
                      <h3 className="font-medium">{roaster.name}</h3>
                    </div>
                    <div className="text-sm text-subtext1 ml-7">
                      {[
                        roaster.country,
                        roaster.specialty,
                        `${roaster.coffees[0]?.count || 0} café${roaster.coffees[0]?.count !== 1 ? 's' : ''}`
                      ].filter(Boolean).join(' • ')}
                    </div>
                  </div>
                  <button
                    onClick={() => openDeleteModal('roaster', roaster.id, roaster.name)}
                    className="p-2 text-subtext1 hover:text-red hover:bg-red/10 rounded-lg transition-colors"
                    title="Eliminar tostador"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Coffees */}
              {activeTab === 'coffees' && filteredCoffees.map((coffee) => (
                <div key={coffee.id} className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Coffee className="w-4 h-4 text-subtext1" />
                      <h3 className="font-medium">{coffee.name}</h3>
                    </div>
                    <div className="text-sm text-subtext1 ml-7">
                      {[
                        coffee.roaster.name,
                        coffee.origin_country,
                        coffee.region,
                        coffee.farm,
                        coffee.process
                      ].filter(Boolean).join(' • ')}
                    </div>
                  </div>
                  <button
                    onClick={() => openDeleteModal('coffee', coffee.id, coffee.name)}
                    className="p-2 text-subtext1 hover:text-red hover:bg-red/10 rounded-lg transition-colors"
                    title="Eliminar café"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Bags */}
              {activeTab === 'bags' && filteredBags.map((bag) => (
                <div key={bag.id} className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Package className="w-4 h-4 text-subtext1" />
                      <h3 className="font-medium">{bag.coffee.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        bag.finish_date 
                          ? 'bg-red/20 text-red'
                          : bag.open_date
                          ? 'bg-yellow/20 text-yellow'
                          : 'bg-green/20 text-green'
                      }`}>
                        {bag.finish_date ? 'Terminada' : bag.open_date ? 'Abierta' : 'Nueva'}
                      </span>
                    </div>
                    <div className="text-sm text-subtext1 ml-7">
                      {[
                        bag.coffee.roaster.name,
                        `${bag.size_g}g`,
                        `Tueste: ${new Date(bag.roast_date).toLocaleDateString('es-ES')}`
                      ].join(' • ')}
                    </div>
                  </div>
                  <button
                    onClick={() => openDeleteModal('bag', bag.id, bag.coffee.name)}
                    className="p-2 text-subtext1 hover:text-red hover:bg-red/10 rounded-lg transition-colors"
                    title="Eliminar bolsa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Empty state */}
              {((activeTab === 'roasters' && filteredRoasters.length === 0) ||
                (activeTab === 'coffees' && filteredCoffees.length === 0) ||
                (activeTab === 'bags' && filteredBags.length === 0)) && (
                <div className="text-center py-12">
                  <p className="text-subtext1">
                    {searchTerm 
                      ? `No se encontraron ${activeTab === 'roasters' ? 'tostadores' : activeTab === 'coffees' ? 'cafés' : 'bolsas'} que coincidan con "${searchTerm}"`
                      : `No hay ${activeTab === 'roasters' ? 'tostadores' : activeTab === 'coffees' ? 'cafés' : 'bolsas'} aún`
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleDelete}
        title={`Eliminar ${deleteModal.type === 'roaster' ? 'Tostador' : deleteModal.type === 'coffee' ? 'Café' : 'Bolsa'}`}
        itemName={deleteModal.name}
        type={deleteModal.type}
        itemId={deleteModal.id}
      />
    </Layout>
  )
}