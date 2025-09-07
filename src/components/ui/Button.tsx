import React from 'react'
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
    ...props
  }, ref) => {
    const baseClasses = [
      // Base styling
      'inline-flex items-center justify-center gap-2',
      'font-medium rounded-lg transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'active:scale-95 transform',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
      // Ensure minimum touch target (44px)
      'min-h-[44px] touch-manipulation'
    ]

    const variants = {
      primary: [
        'bg-peach text-base',
        'hover:bg-peach/90 active:bg-peach/95',
        'shadow-sm hover:shadow-md',
        'focus:ring-peach focus:ring-offset-surface0',
        'border border-transparent'
      ],
      secondary: [
        'bg-surface1 text-text border border-surface2',
        'hover:bg-surface2 hover:border-surface3',
        'shadow-sm hover:shadow-md',
        'focus:ring-text focus:ring-offset-surface0'
      ],
      destructive: [
        'bg-red text-base border border-transparent',
        'hover:bg-red/90 shadow-md hover:shadow-lg',
        'focus:ring-red focus:ring-offset-surface0'
      ],
      ghost: [
        'text-text hover:bg-surface1',
        'focus:ring-text focus:ring-offset-surface0'
      ],
      outline: [
        'border border-overlay0 text-text',
        'hover:bg-surface0 hover:border-overlay1',
        'focus:ring-text focus:ring-offset-surface0'
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
        {...props}
      >
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