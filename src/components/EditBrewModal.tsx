'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { Tooltip, HelpHint } from '@/components/ui/Tooltip'
import { updateBrew, UpdateBrewData } from '@/lib/queries'
import { X, Save, Star } from 'lucide-react'
import { BrewWithBagAndCoffee } from '@/types'

interface EditBrewModalProps {
  brew: BrewWithBagAndCoffee
  onClose: () => void
  onSuccess: (updatedBrew: BrewWithBagAndCoffee) => void
}

export default function EditBrewModal({ brew, onClose, onSuccess }: EditBrewModalProps) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    rating: brew.rating || 5,
    notes: brew.notes || '',
    tasting_notes: (brew as any).tasting_notes || '',
    flavor_notes: (brew as any).flavor_notes || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.rating < 1 || formData.rating > 10) {
      showToast({ type: 'error', title: 'La calificación debe estar entre 1 y 10' })
      return
    }

    setLoading(true)
    
    try {
      const updatedBrew = await updateBrew(brew.id, formData)
      showToast({ type: 'success', title: '¡Brew actualizado exitosamente! ☕' })
      onSuccess(updatedBrew as BrewWithBagAndCoffee)
    } catch (error) {
      console.error('Error updating brew:', error)
      showToast({ type: 'error', title: 'Error al actualizar el brew. Inténtalo de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const renderStars = () => {
    return Array.from({ length: 10 }, (_, index) => {
      const starValue = index + 1
      return (
        <button
          key={starValue}
          type="button"
          onClick={() => handleChange('rating', starValue)}
          className={`text-xl transition-colors hover:scale-110 transform ${
            starValue <= formData.rating 
              ? 'text-yellow hover:text-yellow/80' 
              : 'text-surface2 hover:text-yellow/50'
          }`}
        >
          <Star className={`w-6 h-6 ${starValue <= formData.rating ? 'fill-current' : ''}`} />
        </button>
      )
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface0 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface0 px-6 py-4 border-b border-surface1 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text">✍️ Editar Brew</h2>
              <p className="text-sm text-subtext1 mt-1">
                {brew.bag.coffee.roaster.name} - {brew.bag.coffee.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface1 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-subtext0" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Brew Details Summary */}
          <div className="bg-surface1 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-semibold text-text">{brew.dose_g}g → {brew.yield_g}g</div>
                <div className="text-subtext1">Dosis → Yield</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-text">{brew.time_s}s</div>
                <div className="text-subtext1">Tiempo</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-text">{brew.water_temp_c}°C</div>
                <div className="text-subtext1">Temperatura</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-text">#{brew.grind_setting}</div>
                <div className="text-subtext1">Molienda</div>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div>
            <HelpHint 
              hint="Califica tu brew del 1 al 10. Considera equilibrio, sabor, acidez y cuerpo."
            >
              <label className="block text-sm font-medium text-text mb-3">
                Calificación General
              </label>
            </HelpHint>
            <div className="flex items-center gap-2 mb-2">
              {renderStars()}
              <span className="ml-3 text-lg font-semibold text-peach">
                {formData.rating}/10
              </span>
            </div>
            <p className="text-xs text-subtext1">
              Haz click en las estrellas para calificar
            </p>
          </div>

          {/* Tasting Notes */}
          <div>
            <HelpHint 
              hint="Sabores y aromas que detectaste: cítricos, chocolate, floral, frutal, etc."
            >
              <label className="block text-sm font-medium text-text mb-2">
                Notas de Cata
              </label>
            </HelpHint>
            <textarea
              value={formData.tasting_notes}
              onChange={(e) => handleChange('tasting_notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-surface1 border border-surface2 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent resize-none"
              placeholder="Ej: Cítricos brillantes, chocolate oscuro, final floral..."
            />
          </div>

          {/* Flavor Notes */}
          <div>
            <HelpHint 
              hint="Descripción más detallada del perfil de sabor y sensaciones en boca."
            >
              <label className="block text-sm font-medium text-text mb-2">
                Perfil de Sabor
              </label>
            </HelpHint>
            <textarea
              value={formData.flavor_notes}
              onChange={(e) => handleChange('flavor_notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-surface1 border border-surface2 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent resize-none"
              placeholder="Ej: Acidez media-alta, cuerpo cremoso, dulzor balanceado..."
            />
          </div>

          {/* Notes */}
          <div>
            <HelpHint 
              hint="Notas generales sobre la preparación, ajustes para próxima vez, etc."
            >
              <label className="block text-sm font-medium text-text mb-2">
                Notas Adicionales
              </label>
            </HelpHint>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-surface1 border border-surface2 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent resize-none"
              placeholder="Ej: Excelente extracción, próxima vez moler un poco más fino..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-surface1">
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
              icon={<Save className="w-4 h-4" />}
              fullWidth
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}