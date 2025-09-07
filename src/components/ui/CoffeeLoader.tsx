import React from 'react'
import { cn } from '@/lib/utils'

interface CoffeeLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  className?: string
}

export function CoffeeLoader({ 
  size = 'md', 
  message = 'Preparando café...', 
  className 
}: CoffeeLoaderProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div className="relative">
        {/* Coffee cup animation */}
        <div className="relative">
          <div className="text-4xl animate-bounce">☕</div>
          {/* Steam animation */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-1">
              <div className="w-0.5 h-3 bg-subtext0 rounded-full animate-pulse opacity-60" style={{ animationDelay: '0ms' }} />
              <div className="w-0.5 h-4 bg-subtext0 rounded-full animate-pulse opacity-40" style={{ animationDelay: '200ms' }} />
              <div className="w-0.5 h-3 bg-subtext0 rounded-full animate-pulse opacity-60" style={{ animationDelay: '400ms' }} />
            </div>
          </div>
        </div>
        
        {/* Loading ring */}
        <div className="absolute inset-0 -m-2">
          <div className={cn(
            'border-2 border-surface2 border-t-peach rounded-full animate-spin',
            sizeClasses[size]
          )} />
        </div>
      </div>
      
      {message && (
        <p className={cn(
          'text-subtext1 font-medium animate-pulse',
          textSizes[size]
        )}>
          {message}
        </p>
      )}
    </div>
  )
}

// Specialized loaders for different contexts
export function BrewingLoader() {
  return (
    <CoffeeLoader 
      message="Extrayendo el café perfecto..." 
      size="lg"
      className="py-8"
    />
  )
}

export function AnalyzingLoader() {
  return (
    <CoffeeLoader 
      message="Analizando tu extracción..." 
      size="lg"
      className="py-8"
    />
  )
}

export function LoadingBags() {
  return (
    <CoffeeLoader 
      message="Cargando tu colección..." 
      size="md"
      className="py-6"
    />
  )
}