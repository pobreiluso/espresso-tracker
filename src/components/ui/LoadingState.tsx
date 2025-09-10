'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  title: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16'
}

export function LoadingState({ 
  title, 
  subtitle, 
  size = 'md',
  className 
}: LoadingStateProps) {
  return (
    <div className={cn('text-center space-y-4', className)}>
      <Loader2 className={cn(
        'animate-spin mx-auto text-peach',
        sizeClasses[size]
      )} />
      <div>
        <h3 className="text-lg font-medium text-text">{title}</h3>
        {subtitle && (
          <p className="text-subtext0 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

interface FullPageLoadingProps {
  title: string
  subtitle?: string
}

export function FullPageLoading({ title, subtitle }: FullPageLoadingProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg p-8 text-center max-w-sm w-full">
        <LoadingState title={title} subtitle={subtitle} />
      </div>
    </div>
  )
}