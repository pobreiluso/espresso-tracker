'use client'

import { formatDistanceToNow, parseISO } from 'date-fns'
import { Calendar, MapPin, DollarSign, Coffee, Trash2, Plus, Eye } from 'lucide-react'
import { Button } from './ui/Button'
import { useState } from 'react'

interface BagCardProps {
  bag: any // Will be properly typed when we have the full bag type
  onFinish?: () => void
  onDelete?: () => void
  onNewBrew?: () => void
}

export default function BagCard({ bag, onFinish, onDelete, onNewBrew }: BagCardProps) {
  const [isFinishing, setIsFinishing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const isOpen = !bag.finish_date
  const roastDate = bag.roast_date ? parseISO(bag.roast_date) : null
  const openDate = bag.open_date ? parseISO(bag.open_date) : null
  const finishDate = bag.finish_date ? parseISO(bag.finish_date) : null

  const daysOpen = openDate ? formatDistanceToNow(openDate) : null
  const daysSinceRoast = roastDate ? formatDistanceToNow(roastDate) : null

  const handleFinish = async () => {
    if (!onFinish) return
    setIsFinishing(true)
    try {
      await onFinish()
    } finally {
      setIsFinishing(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setIsDeleting(true)
    try {
      await onDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={`card p-4 transition-all hover:shadow-md active:scale-[0.98] ${
      isOpen ? 'border-primary/20' : 'border-overlay0 opacity-75'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{bag.coffee.name}</h3>
          <p className="text-subtext1 font-medium">{bag.coffee.roaster.name}</p>
          {bag.coffee.origin_country && (
            <p className="text-sm text-subtext0">
              {bag.coffee.origin_country}
              {bag.coffee.region && ` • ${bag.coffee.region}`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isOpen && (
            <div className="px-2 py-1 bg-green/20 text-green text-xs rounded-full">
              Open
            </div>
          )}
          {!isOpen && (
            <div className="px-2 py-1 bg-overlay2 text-subtext1 text-xs rounded-full">
              Finished
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-subtext1">
          <Coffee className="w-4 h-4" />
          <span>{bag.size_g}g</span>
        </div>
        {bag.price && (
          <div className="flex items-center gap-2 text-sm text-subtext1">
            <DollarSign className="w-4 h-4" />
            <span>${bag.price}</span>
          </div>
        )}
        {roastDate && (
          <div className="flex items-center gap-2 text-sm text-subtext1">
            <Calendar className="w-4 h-4" />
            <span>Roasted {daysSinceRoast} ago</span>
          </div>
        )}
        {bag.purchase_location && (
          <div className="flex items-center gap-2 text-sm text-subtext1">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{bag.purchase_location}</span>
          </div>
        )}
      </div>

      {openDate && isOpen && (
        <div className="mb-3 p-2 bg-surface1 rounded text-sm">
          <span className="text-subtext1">Open for </span>
          <span className="font-medium text-text">{daysOpen}</span>
        </div>
      )}

      {finishDate && !isOpen && (
        <div className="mb-3 p-2 bg-surface1 rounded text-sm">
          <span className="text-subtext1">Finished </span>
          <span className="font-medium text-text">{formatDistanceToNow(finishDate)} ago</span>
        </div>
      )}

      {bag.coffee.tasting_notes && (
        <div className="mb-4">
          <p className="text-sm text-subtext1 line-clamp-2">
            {bag.coffee.tasting_notes}
          </p>
        </div>
      )}

      {/* Modern button system with proper loading states */}
      <div className="flex gap-3">
        {isOpen && (
          <>
            <Button 
              variant="primary" 
              size="md" 
              fullWidth
              icon={<Plus className="w-4 h-4" />}
              className="flex-1"
              onClick={onNewBrew}
              disabled={!onNewBrew}
            >
              Nuevo Brew
            </Button>
            <Button 
              variant="secondary" 
              size="md"
              loading={isFinishing}
              onClick={handleFinish}
              className="px-4"
            >
              Terminar
            </Button>
          </>
        )}
        {!isOpen && (
          <Button 
            variant="secondary" 
            size="md" 
            fullWidth
            icon={<Eye className="w-4 h-4" />}
          >
            Ver Detalles
          </Button>
        )}
        {onDelete && (
          <Button 
            variant="destructive"
            size="md"
            loading={isDeleting}
            onClick={handleDelete}
            icon={<Trash2 className="w-4 h-4" />}
            title="Eliminar bolsa de café"
            className="px-3 bg-red/10 text-red hover:bg-red hover:text-base border-red/20"
          />
        )}
      </div>
    </div>
  )
}