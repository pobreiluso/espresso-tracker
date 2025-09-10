'use client'

import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  color: 'peach' | 'green' | 'yellow' | 'mauve'
  onClick?: () => void
  className?: string
}

export function StatCard({ icon, value, label, color, onClick, className }: StatCardProps) {
  const colorClasses = {
    peach: {
      value: 'text-peach group-hover:text-peach/90',
      shadow: 'hover:shadow-peach/20',
      gradient: 'before:from-peach'
    },
    green: {
      value: 'text-green group-hover:text-green/90',
      shadow: 'hover:shadow-green/20',
      gradient: 'before:from-green'
    },
    yellow: {
      value: 'text-yellow group-hover:text-yellow/90',
      shadow: 'hover:shadow-yellow/20',
      gradient: 'before:from-yellow'
    },
    mauve: {
      value: 'text-mauve group-hover:text-mauve/90',
      shadow: 'hover:shadow-mauve/20',
      gradient: 'before:from-mauve'
    }
  }

  const colors = colorClasses[color]
  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      onClick={onClick}
      className={cn(
        'group card p-4 transition-all duration-300 overflow-hidden relative',
        'before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300',
        'before:bg-gradient-to-br before:to-transparent',
        colors.gradient,
        onClick && [
          'hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] cursor-pointer',
          colors.shadow,
          'hover:before:opacity-5'
        ],
        className
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
          {icon}
        </span>
        <div className={cn(
          'text-2xl font-bold transition-colors duration-200',
          colors.value
        )}>
          {value}
        </div>
      </div>
      <div className="text-sm text-subtext1 group-hover:text-text transition-colors duration-200">
        {label}
      </div>
    </Component>
  )
}