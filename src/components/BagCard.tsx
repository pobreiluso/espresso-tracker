'use client'

import { formatDistanceToNow, parseISO } from 'date-fns'
import { Calendar, MapPin, DollarSign, Coffee, Trash2, Plus, Eye } from 'lucide-react'
import { Button } from './ui/Button'
import { Tooltip } from './ui/Tooltip'
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
    <div className={`
      group relative card p-4 overflow-hidden
      transition-all duration-300 ease-out
      hover:shadow-xl hover:shadow-surface2/50 hover:-translate-y-1 hover:scale-[1.01]
      active:scale-[0.98] active:translate-y-0
      cursor-pointer
      before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300
      hover:before:opacity-5 before:bg-gradient-to-br before:from-peach before:to-transparent
      ${isOpen ? 'border-peach/30 hover:border-peach/60' : 'border-overlay0 opacity-75 hover:opacity-90'}
    `}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg group-hover:text-peach transition-colors duration-200">{bag.coffee.name}</h3>
          <p className="text-subtext1 font-medium group-hover:text-text transition-colors duration-200">{bag.coffee.roaster.name}</p>
          {bag.coffee.origin_country && (
            <p className="text-sm text-subtext0 group-hover:text-subtext1 transition-colors duration-200">
              {bag.coffee.origin_country}
              {bag.coffee.region && ` • ${bag.coffee.region}`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isOpen && (
            <Tooltip content="Este café está disponible para extracciones. Haz click en 'Marcar Terminado' cuando se acabe.">
              <div className="px-2 py-1 bg-green/20 text-green text-xs rounded-full 
                            transform group-hover:scale-105 transition-all duration-200
                            shadow-sm group-hover:shadow-md group-hover:bg-green/30 cursor-help">
                Abierto ☕
              </div>
            </Tooltip>
          )}
          {!isOpen && (
            <Tooltip content="Esta bolsa de café se ha marcado como terminada y ya no está disponible para extracciones.">
              <div className="px-2 py-1 bg-overlay2 text-subtext1 text-xs rounded-full
                            transform group-hover:scale-105 transition-all duration-200
                            shadow-sm group-hover:shadow-md cursor-help">
                Terminado ✓
              </div>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-subtext1 group-hover:text-text transition-colors duration-200">
          <Coffee className="w-4 h-4 group-hover:text-peach group-hover:scale-110 transition-all duration-200" />
          <span>{bag.size_g}g</span>
        </div>
        {bag.price && (
          <div className="flex items-center gap-2 text-sm text-subtext1 group-hover:text-text transition-colors duration-200">
            <DollarSign className="w-4 h-4 group-hover:text-green group-hover:scale-110 transition-all duration-200" />
            <span>€{bag.price}</span>
          </div>
        )}
        {roastDate && (
          <div className="flex items-center gap-2 text-sm text-subtext1 group-hover:text-text transition-colors duration-200">
            <Calendar className="w-4 h-4 group-hover:text-yellow group-hover:scale-110 transition-all duration-200" />
            <span>Tostado hace {daysSinceRoast}</span>
          </div>
        )}
        {bag.purchase_location && (
          <div className="flex items-center gap-2 text-sm text-subtext1 group-hover:text-text transition-colors duration-200">
            <MapPin className="w-4 h-4 group-hover:text-blue group-hover:scale-110 transition-all duration-200" />
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