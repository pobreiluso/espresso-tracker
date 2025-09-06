'use client'

import { useState, useEffect } from 'react'
import { Trash2, AlertTriangle, Loader2, X } from 'lucide-react'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title: string
  itemName: string
  type: 'roaster' | 'coffee' | 'bag'
  itemId: string
}

interface DeletionImpact {
  coffees?: number
  bags?: number
  brews?: number
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  type,
  itemId
}: DeleteConfirmationModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [impact, setImpact] = useState<DeletionImpact | null>(null)
  const [impactLoading, setImpactLoading] = useState(false)

  useEffect(() => {
    if (isOpen && itemId) {
      fetchDeletionImpact()
    }
  }, [isOpen, itemId, type])

  const fetchDeletionImpact = async () => {
    setImpactLoading(true)
    try {
      const response = await fetch(`/api/${type}s/${itemId}?action=impact`)
      const data = await response.json()
      
      if (data.success) {
        setImpact(data.impact)
      }
    } catch (error) {
      console.error('Error fetching deletion impact:', error)
    } finally {
      setImpactLoading(false)
    }
  }

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Error during deletion:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const renderImpactMessage = () => {
    if (impactLoading) {
      return <div className="flex items-center gap-2 text-subtext1 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Calculando impacto...
      </div>
    }

    if (!impact) return null

    const parts = []
    if (impact.coffees) parts.push(`${impact.coffees} café${impact.coffees !== 1 ? 's' : ''}`)
    if (impact.bags) parts.push(`${impact.bags} bolsa${impact.bags !== 1 ? 's' : ''}`)
    if (impact.brews) parts.push(`${impact.brews} extracción${impact.brews !== 1 ? 'es' : ''}`)

    if (parts.length === 0) {
      return (
        <div className="text-subtext1 text-sm">
          No hay datos asociados que se eliminen.
        </div>
      )
    }

    return (
      <div className="bg-red/10 border border-red/20 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2 text-sm">
          <AlertTriangle className="w-4 h-4 text-red mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium text-red mb-1">
              Esta acción también eliminará:
            </div>
            <div className="text-red/80">
              {parts.join(', ')}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red/10 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-subtext1 text-sm">Esta acción no se puede deshacer</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="bg-surface0 rounded-lg p-3 mb-3">
              <div className="font-medium text-sm text-subtext0 mb-1">
                {type === 'roaster' ? 'Tostador' : type === 'coffee' ? 'Café' : 'Bolsa'}
              </div>
              <div className="font-medium">{itemName}</div>
            </div>

            {renderImpactMessage()}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="btn btn-secondary flex-1 h-11"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting || impactLoading}
              className="btn btn-destructive flex-1 h-11 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}