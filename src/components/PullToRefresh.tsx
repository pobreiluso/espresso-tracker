'use client'

import { useState, useRef, useCallback } from 'react'
import { Loader2, RotateCcw } from 'lucide-react'

interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => void
  isRefreshing?: boolean
  disabled?: boolean
}

export default function PullToRefresh({ 
  children, 
  onRefresh, 
  isRefreshing = false,
  disabled = false
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const startY = useRef(0)
  const currentY = useRef(0)
  const pullThreshold = 100

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return
    startY.current = e.touches[0].clientY
    setIsPulling(true)
  }, [disabled])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || disabled) return

    currentY.current = e.touches[0].clientY
    const distance = Math.max(0, currentY.current - startY.current)
    
    // Only pull if we're at the top of the page
    if (window.scrollY === 0 && distance > 0) {
      e.preventDefault()
      setPullDistance(Math.min(distance * 0.5, pullThreshold * 1.5))
    }
  }, [isPulling, disabled, pullThreshold])

  const handleTouchEnd = useCallback(() => {
    if (!isPulling || disabled) return

    setIsPulling(false)
    
    if (pullDistance >= pullThreshold) {
      onRefresh()
    }
    
    setPullDistance(0)
  }, [isPulling, disabled, pullDistance, pullThreshold, onRefresh])

  const pullProgress = Math.min(pullDistance / pullThreshold, 1)
  const shouldTrigger = pullDistance >= pullThreshold

  return (
    <div 
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      {(isPulling || isRefreshing) && pullDistance > 10 && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-surface0 border-b border-overlay0 transition-all duration-200 z-10"
          style={{ 
            height: `${Math.min(pullDistance, pullThreshold)}px`,
            transform: `translateY(-${Math.max(0, pullThreshold - pullDistance)}px)`
          }}
        >
          <div className="flex items-center gap-2 text-sm">
            {isRefreshing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-primary font-medium">Actualizando...</span>
              </>
            ) : shouldTrigger ? (
              <>
                <RotateCcw 
                  className="w-4 h-4 text-primary" 
                  style={{ transform: 'rotate(180deg)' }}
                />
                <span className="text-primary font-medium">Suelta para actualizar</span>
              </>
            ) : (
              <>
                <RotateCcw 
                  className="w-4 h-4 text-subtext1 transition-transform" 
                  style={{ 
                    transform: `rotate(${pullProgress * 180}deg)` 
                  }}
                />
                <span className="text-subtext1">Desliza hacia abajo</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div 
        className="transition-transform duration-200"
        style={{ 
          transform: `translateY(${isPulling ? pullDistance : isRefreshing ? 60 : 0}px)` 
        }}
      >
        {children}
      </div>
    </div>
  )
}