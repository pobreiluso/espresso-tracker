'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { Tooltip, HelpHint } from '@/components/ui/Tooltip'
import { createBag } from '@/lib/queries'
import { supabase } from '@/lib/supabase'
import { X, Plus, Search, ChevronDown, ChevronUp, Info, HelpCircle } from 'lucide-react'

interface ManualBagEntryProps {
  onClose: () => void
  onSuccess: () => void
}

export default function ManualBagEntry({ onClose, onSuccess }: ManualBagEntryProps) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    roasterName: '',
    coffeeName: '',
    origin: '',
    process: '',
    tastingNotes: '',
    roastDate: '',
    sizeG: '',
    price: ''
  })

  // Autocomplete suggestions
  const [roasterSuggestions, setRoasterSuggestions] = useState<string[]>([])
  const [coffeeSuggestions, setCoffeeSuggestions] = useState<any[]>([])
  const [showRoasterSuggestions, setShowRoasterSuggestions] = useState(false)
  const [showCoffeeSuggestions, setShowCoffeeSuggestions] = useState(false)
  const [allRoasters, setAllRoasters] = useState<string[]>([])
  const [allCoffees, setAllCoffees] = useState<any[]>([])
  const [allOrigins, setAllOrigins] = useState<string[]>([])
  const [allProcesses, setAllProcesses] = useState<string[]>([])
  const [showAdvancedFields, setShowAdvancedFields] = useState(false)

  // Load existing roasters and coffees for autocomplete
  useEffect(() => {
    const loadAutocompleteData = async () => {
      try {
        // Load roasters
        const { data: roasters } = await supabase
          .from('roasters')
          .select('name')
          .order('name')
        
        // Load coffees with roaster info
        const { data: coffees } = await supabase
          .from('coffees')
          .select(`
            name,
            origin_country,
            process,
            tasting_notes,
            roaster:roasters(name)
          `)
          .order('name')

        setAllRoasters(roasters?.map(r => r.name) || [])
        setAllCoffees(coffees || [])
        
        // Extract unique origins and processes
        if (coffees) {
          const uniqueOrigins = [...new Set(coffees
            .map(c => c.origin_country)
            .filter(Boolean)
          )].sort() as string[]
          
          const uniqueProcesses = [...new Set(coffees
            .map(c => c.process)
            .filter(Boolean)
          )].sort() as string[]
          
          setAllOrigins(uniqueOrigins)
          setAllProcesses(uniqueProcesses)
        }
      } catch (error) {
        console.error('Error loading autocomplete data:', error)
      }
    }
    
    loadAutocompleteData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.roasterName || !formData.coffeeName) {
      showToast({ type: 'error', title: 'Por favor completa al menos el tostador y nombre del café' })
      return
    }

    setLoading(true)
    
    try {
      await createBag({
        roaster_name: formData.roasterName,
        coffee_name: formData.coffeeName,
        origin: formData.origin || null,
        process: formData.process || null,
        tasting_notes: formData.tastingNotes || null,
        roast_date: formData.roastDate ? new Date(formData.roastDate) : null,
        size_g: formData.sizeG ? parseInt(formData.sizeG) : null,
        price: formData.price ? parseFloat(formData.price) : null
      })
      
      showToast({ type: 'success', title: '¡Café añadido exitosamente! ☕' })
      onSuccess()
    } catch (error) {
      console.error('Error creating bag:', error)
      showToast({ type: 'error', title: 'Error al añadir el café. Inténtalo de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Handle autocomplete for roaster
    if (field === 'roasterName') {
      if (value.length > 0) {
        const filtered = allRoasters.filter(name => 
          name.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5)
        setRoasterSuggestions(filtered)
        setShowRoasterSuggestions(filtered.length > 0)
      } else {
        setShowRoasterSuggestions(false)
      }
    }

    // Handle autocomplete for coffee - also suggest based on roaster
    if (field === 'coffeeName') {
      if (value.length > 0) {
        let filtered = allCoffees.filter(coffee => 
          coffee.name.toLowerCase().includes(value.toLowerCase())
        )
        
        // Prioritize coffees from the selected roaster
        if (formData.roasterName) {
          const roasterCoffees = filtered.filter(coffee => 
            coffee.roaster.name.toLowerCase() === formData.roasterName.toLowerCase()
          )
          const otherCoffees = filtered.filter(coffee => 
            coffee.roaster.name.toLowerCase() !== formData.roasterName.toLowerCase()
          )
          filtered = [...roasterCoffees, ...otherCoffees]
        }
        
        setCoffeeSuggestions(filtered.slice(0, 5))
        setShowCoffeeSuggestions(filtered.length > 0)
      } else {
        setShowCoffeeSuggestions(false)
      }
    }
  }

  const selectRoaster = (roasterName: string) => {
    setFormData(prev => ({ ...prev, roasterName }))
    setShowRoasterSuggestions(false)
  }

  const selectCoffee = (coffee: any) => {
    setFormData(prev => ({
      ...prev,
      coffeeName: coffee.name,
      origin: coffee.origin_country || prev.origin,
      process: coffee.process || prev.process,
      tastingNotes: coffee.tasting_notes || prev.tastingNotes,
      roasterName: coffee.roaster.name // Auto-fill roaster if not set
    }))
    setShowCoffeeSuggestions(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface0 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface0 px-6 py-4 border-b border-surface1 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text">✍️ Añadir Café Manual</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface1 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-subtext0" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Fields */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-medium text-text">Información Básica</h3>
              <div className="h-px bg-surface2 flex-1"></div>
            </div>
            
          <div className="relative">
            <HelpHint 
              hint="El tostador que produjo este café. Empieza a escribir para ver sugerencias de tostadores existentes."
            >
              <label className="block text-sm font-medium text-text mb-2">
                Tostador *
              </label>
            </HelpHint>
            <div className="relative">
              <input
                type="text"
                value={formData.roasterName}
                onChange={(e) => handleChange('roasterName', e.target.value)}
                onFocus={() => formData.roasterName && setShowRoasterSuggestions(roasterSuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowRoasterSuggestions(false), 200)}
                className="w-full px-3 py-2 bg-surface1 border border-surface2 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent pr-10"
                placeholder="Ej: Nomad Coffee"
                required
              />
              {formData.roasterName && (
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext0" />
              )}
              
              {/* Roaster suggestions dropdown */}
              {showRoasterSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-surface0 border border-surface2 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {roasterSuggestions.map((roaster, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectRoaster(roaster)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-surface1 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      <span className="font-medium">{roaster}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <HelpHint 
              hint="El nombre específico del café. Al seleccionar un café existente se auto-completarán otros campos como origen y proceso."
            >
              <label className="block text-sm font-medium text-text mb-2">
                Nombre del Café *
              </label>
            </HelpHint>
            <div className="relative">
              <input
                type="text"
                value={formData.coffeeName}
                onChange={(e) => handleChange('coffeeName', e.target.value)}
                onFocus={() => formData.coffeeName && setShowCoffeeSuggestions(coffeeSuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowCoffeeSuggestions(false), 200)}
                className="w-full px-3 py-2 bg-surface1 border border-surface2 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent pr-10"
                placeholder="Ej: Ethiopia Yirgacheffe"
                required
              />
              {formData.coffeeName && (
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext0" />
              )}
              
              {/* Coffee suggestions dropdown */}
              {showCoffeeSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-surface0 border border-surface2 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {coffeeSuggestions.map((coffee, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectCoffee(coffee)}
                      className="w-full text-left px-3 py-3 text-sm hover:bg-surface1 transition-colors first:rounded-t-lg last:rounded-b-lg border-b border-surface1 last:border-b-0"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{coffee.name}</span>
                        <div className="text-xs text-subtext1 flex items-center gap-2">
                          <span>{coffee.roaster.name}</span>
                          {coffee.origin_country && (
                            <>
                              <span>•</span>
                              <span>{coffee.origin_country}</span>
                            </>
                          )}
                          {coffee.process && (
                            <>
                              <span>•</span>
                              <span>{coffee.process}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Weight and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Tooltip content="Peso típico: 250g para bolsa estándar, 1kg para bolsas grandes">
                <label className="block text-sm font-medium text-text mb-2 cursor-help">
                  Peso (gramos) <HelpCircle className="inline w-3 h-3 ml-1 opacity-60" />
                </label>
              </Tooltip>
              <input
                type="number"
                value={formData.sizeG}
                onChange={(e) => handleChange('sizeG', e.target.value)}
                className="w-full px-3 py-2 bg-surface1 border border-surface2 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent"
                placeholder="250"
              />
            </div>

            <div>
              <Tooltip content="Precio opcional. Útil para calcular el coste por taza y llevar control de gastos.">
                <label className="block text-sm font-medium text-text mb-2 cursor-help">
                  Precio (€) <HelpCircle className="inline w-3 h-3 ml-1 opacity-60" />
                </label>
              </Tooltip>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className="w-full px-3 py-2 bg-surface1 border border-surface2 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent"
                placeholder="12.50"
              />
            </div>
          </div>
          </div>

          {/* Progressive Disclosure Button */}
          <Tooltip 
            content={showAdvancedFields ? 
              'Ocultar campos opcionales como origen, proceso, notas y fecha de tueste' : 
              'Añadir información adicional como origen, proceso, notas de cata y fecha de tueste'
            }
            position="top"
          >
            <button
              type="button"
              onClick={() => setShowAdvancedFields(!showAdvancedFields)}
              className="flex items-center justify-center gap-2 w-full py-3 text-peach hover:text-peach/80 transition-colors font-medium group"
            >
              {showAdvancedFields ? <ChevronUp className="w-4 h-4 group-hover:scale-110 transition-transform" /> : <ChevronDown className="w-4 h-4 group-hover:scale-110 transition-transform" />}
              <span>{showAdvancedFields ? 'Ocultar detalles avanzados' : 'Añadir más detalles'}</span>
              <Info className="w-4 h-4 opacity-60" />
            </button>
          </Tooltip>

          {/* Advanced Fields - Animated Disclosure */}
          {showAdvancedFields && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300 border-t border-surface2 pt-6 mt-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-medium text-text">Detalles del Café</h3>
                <div className="h-px bg-surface2 flex-1"></div>
              </div>

          <div>
            <HelpHint 
              hint="País y región de origen del café. Ejemplo: Ethiopia, Yirgacheffe o Colombia, Huila"
            >
              <label className="block text-sm font-medium text-text mb-2">
                Origen
              </label>
            </HelpHint>
            <input
              type="text"
              value={formData.origin}
              onChange={(e) => handleChange('origin', e.target.value)}
              className="w-full px-3 py-2 bg-surface1 border border-surface2 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent"
              placeholder="Ej: Ethiopia, Yirgacheffe"
              list="origins-list"
            />
            <datalist id="origins-list">
              {allOrigins.map((origin, index) => (
                <option key={index} value={origin} />
              ))}
            </datalist>
          </div>

          <div>
            <HelpHint 
              hint="Método de procesamiento del café: Lavado (más limpio), Natural (más frutal), Honey (equilibrado)"
            >
              <label className="block text-sm font-medium text-text mb-2">
                Proceso
              </label>
            </HelpHint>
            <input
              type="text"
              value={formData.process}
              onChange={(e) => handleChange('process', e.target.value)}
              className="w-full px-3 py-2 bg-surface1 border border-surface2 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent"
              placeholder="Ej: Lavado, Natural, Honey"
              list="processes-list"
            />
            <datalist id="processes-list">
              {allProcesses.map((process, index) => (
                <option key={index} value={process} />
              ))}
            </datalist>
          </div>

          <div>
            <HelpHint 
              hint="Sabores y aromas característicos del café. Ejemplo: Chocolate, cítricos, floral, frutas rojas"
            >
              <label className="block text-sm font-medium text-text mb-2">
                Notas de Cata
              </label>
            </HelpHint>
            <textarea
              value={formData.tastingNotes}
              onChange={(e) => handleChange('tastingNotes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-surface1 border border-surface2 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent resize-none"
              placeholder="Ej: Cítricos, chocolate, floral"
            />
          </div>

          <div>
            <Tooltip content="El café está en su mejor momento entre 7-30 días después del tueste. Muy reciente puede ser demasiado desgasificado.">
              <label className="block text-sm font-medium text-text mb-2 cursor-help">
                Fecha de Tueste <HelpCircle className="inline w-3 h-3 ml-1 opacity-60" />
              </label>
            </Tooltip>
            <input
              type="date"
              value={formData.roastDate}
              onChange={(e) => handleChange('roastDate', e.target.value)}
              className="w-full px-3 py-2 bg-surface1 border border-surface2 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent"
            />
          </div>
          </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={<Plus className="w-4 h-4" />}
              fullWidth
            >
              {loading ? 'Añadiendo...' : 'Añadir Café'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}