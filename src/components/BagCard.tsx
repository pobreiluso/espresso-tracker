'use client'

import { formatDistanceToNow, parseISO } from 'date-fns'
import { Calendar, MapPin, DollarSign, Coffee, Trash2 } from 'lucide-react'

interface BagCardProps {
  bag: any // Will be properly typed when we have the full bag type
  onFinish?: () => void
  onDelete?: () => void
}

export default function BagCard({ bag, onFinish, onDelete }: BagCardProps) {
  const isOpen = !bag.finish_date
  const roastDate = bag.roast_date ? parseISO(bag.roast_date) : null
  const openDate = bag.open_date ? parseISO(bag.open_date) : null
  const finishDate = bag.finish_date ? parseISO(bag.finish_date) : null

  const daysOpen = openDate ? formatDistanceToNow(openDate) : null
  const daysSinceRoast = roastDate ? formatDistanceToNow(roastDate) : null

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

      <div className="flex gap-2">
        {isOpen && (
          <>
            <button className="btn btn-primary flex-1 text-sm h-9 font-medium">
              + Nuevo Brew
            </button>
            <button 
              onClick={onFinish}
              className="btn btn-secondary text-sm h-9 px-3 whitespace-nowrap"
            >
              Terminar
            </button>
          </>
        )}
        {!isOpen && (
          <button className="btn btn-secondary flex-1 text-sm h-9">
            Ver Detalles
          </button>
        )}
        {onDelete && (
          <button 
            onClick={onDelete}
            className="btn bg-red/10 text-red hover:bg-red hover:text-white active:scale-95 text-sm px-3 h-9 transition-all"
            title="Eliminar café"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}