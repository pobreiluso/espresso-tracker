import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type,
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    
    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type

    const baseClasses = [
      'flex h-12 w-full rounded-lg border transition-all duration-200',
      'bg-surface1 text-text placeholder:text-subtext0',
      'focus-within:outline-none focus-within:ring-2 focus-within:ring-peach focus-within:ring-offset-2 focus-within:ring-offset-surface0',
      'hover:border-overlay1',
      disabled && 'opacity-50 cursor-not-allowed',
      error
        ? 'border-red focus-within:ring-red'
        : 'border-surface2 focus-within:border-peach',
    ]

    const inputClasses = [
      'flex-1 bg-transparent px-3 py-3 text-sm',
      'focus:outline-none',
      'disabled:cursor-not-allowed',
      leftIcon && 'pl-0',
      (rightIcon || isPassword) && 'pr-0',
    ]

    return (
      <div className={cn('space-y-2', fullWidth ? 'w-full' : '')}>
        {label && (
          <label className={cn(
            'block text-sm font-medium transition-colors',
            error ? 'text-red' : 'text-text',
            disabled && 'opacity-50'
          )}>
            {label}
          </label>
        )}
        
        <div className={cn(baseClasses, className)}>
          {leftIcon && (
            <div className="flex items-center pl-3 pr-2 text-subtext1">
              {leftIcon}
            </div>
          )}
          
          <input
            type={inputType}
            className={cn(inputClasses)}
            disabled={disabled}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {isPassword && (
            <button
              type="button"
              className="flex items-center pr-3 pl-2 text-subtext1 hover:text-text transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
          
          {rightIcon && !isPassword && (
            <div className="flex items-center pr-3 pl-2 text-subtext1">
              {rightIcon}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <div className="flex items-start gap-1">
            {error && (
              <AlertCircle className="w-4 h-4 text-red mt-0.5 flex-shrink-0" />
            )}
            <p className={cn(
              'text-xs leading-relaxed',
              error ? 'text-red' : 'text-subtext1'
            )}>
              {error || helperText}
            </p>
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Textarea variant
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    label,
    error,
    helperText,
    fullWidth = false,
    disabled,
    rows = 3,
    ...props
  }, ref) => {
    const baseClasses = [
      'flex min-h-[80px] w-full rounded-lg border px-3 py-3 text-sm transition-all duration-200',
      'bg-surface1 text-text placeholder:text-subtext0',
      'focus:outline-none focus:ring-2 focus:ring-peach focus:ring-offset-2 focus:ring-offset-surface0',
      'hover:border-overlay1 resize-none',
      disabled && 'opacity-50 cursor-not-allowed',
      error
        ? 'border-red focus:ring-red'
        : 'border-surface2 focus:border-peach',
    ]

    return (
      <div className={cn('space-y-2', fullWidth ? 'w-full' : '')}>
        {label && (
          <label className={cn(
            'block text-sm font-medium transition-colors',
            error ? 'text-red' : 'text-text',
            disabled && 'opacity-50'
          )}>
            {label}
          </label>
        )}
        
        <textarea
          className={cn(baseClasses, className)}
          disabled={disabled}
          rows={rows}
          ref={ref}
          {...props}
        />

        {(error || helperText) && (
          <div className="flex items-start gap-1">
            {error && (
              <AlertCircle className="w-4 h-4 text-red mt-0.5 flex-shrink-0" />
            )}
            <p className={cn(
              'text-xs leading-relaxed',
              error ? 'text-red' : 'text-subtext1'
            )}>
              {error || helperText}
            </p>
          </div>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'