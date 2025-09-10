'use client'

import { cn } from '@/lib/utils'

interface ConfidenceIndicatorProps {
  confidence: number
  className?: string
}

export function ConfidenceIndicator({ confidence, className }: ConfidenceIndicatorProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'bg-green/20 text-green'
    if (confidence > 0.6) return 'bg-yellow/20 text-yellow'
    return 'bg-red/20 text-red'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence > 0.8) return 'Alta'
    if (confidence > 0.6) return 'Media'
    return 'Baja'
  }

  return (
    <div className={cn('card p-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Confianza de Detección</span>
        <div className="flex items-center gap-2">
          <span className={cn(
            'px-2 py-1 rounded text-xs font-medium',
            getConfidenceColor(confidence)
          )}>
            {getConfidenceLabel(confidence)}
          </span>
          <span className="text-xs text-subtext1">
            {Math.round(confidence * 100)}%
          </span>
        </div>
      </div>
    </div>
  )
}