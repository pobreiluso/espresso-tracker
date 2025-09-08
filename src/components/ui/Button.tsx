import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    children,
    disabled,
    onClick,
    ...props
  }, ref) => {
    const [isClicked, setIsClicked] = useState(false)
    const baseClasses = [
      // Base styling
      'inline-flex items-center justify-center gap-2 relative overflow-hidden',
      'font-medium rounded-lg transition-all duration-200 ease-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'active:scale-95 transform hover:scale-[1.02]',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:scale-100',
      // Ensure minimum touch target (44px)
      'min-h-[44px] touch-manipulation',
      // Add subtle gradient overlay for depth
      'before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-200',
      'hover:before:opacity-10 before:bg-gradient-to-r before:from-white before:to-transparent'
    ]

    const variants = {
      primary: [
        'bg-peach text-base',
        'hover:bg-peach/90 active:bg-peach/95 hover:shadow-lg hover:shadow-peach/25',
        'shadow-md hover:shadow-xl transition-shadow duration-300',
        'focus:ring-peach focus:ring-offset-surface0 focus:shadow-lg',
        'border border-transparent',
        'hover:-translate-y-0.5 active:translate-y-0'
      ],
      secondary: [
        'bg-surface1 text-text border border-surface2',
        'hover:bg-surface2 hover:border-surface3 hover:shadow-lg hover:shadow-surface2/50',
        'shadow-md hover:shadow-xl transition-shadow duration-300',
        'focus:ring-text focus:ring-offset-surface0',
        'hover:-translate-y-0.5 active:translate-y-0'
      ],
      destructive: [
        'bg-red text-base border border-transparent',
        'hover:bg-red/90 shadow-lg hover:shadow-xl hover:shadow-red/25',
        'transition-shadow duration-300',
        'focus:ring-red focus:ring-offset-surface0',
        'hover:-translate-y-0.5 active:translate-y-0'
      ],
      ghost: [
        'text-text hover:bg-surface1 hover:shadow-md',
        'focus:ring-text focus:ring-offset-surface0',
        'hover:-translate-y-0.5 active:translate-y-0 transition-transform'
      ],
      outline: [
        'border border-overlay0 text-text',
        'hover:bg-surface0 hover:border-overlay1 hover:shadow-md',
        'focus:ring-text focus:ring-offset-surface0',
        'hover:-translate-y-0.5 active:translate-y-0 transition-transform'
      ]
    }

    const sizes = {
      sm: 'px-3 py-2 text-sm min-h-[36px]',
      md: 'px-4 py-2.5 text-sm min-h-[44px]',
      lg: 'px-6 py-3 text-base min-h-[48px]',
      xl: 'px-8 py-4 text-lg min-h-[52px]'
    }

    const widthClasses = fullWidth ? 'w-full' : ''

    const isDisabled = disabled || loading

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return
      
      setIsClicked(true)
      setTimeout(() => setIsClicked(false), 200)
      
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          widthClasses,
          className
        )}
        disabled={isDisabled}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple effect */}
        {isClicked && (
          <span className="absolute inset-0 animate-ping rounded-lg bg-white opacity-20" />
        )}
        
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin" />
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        
        {children && (
          <span className={loading ? 'opacity-70' : ''}>
            {children}
          </span>
        )}
        
        {!loading && icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'