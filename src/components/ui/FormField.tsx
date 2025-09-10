'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: ReactNode
  error?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function FormField({ label, error, required, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-text">
        {label}
        {required && <span className="text-red ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red text-sm">{error}</p>
      )}
    </div>
  )
}

interface FormInputProps {
  type?: string
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  min?: number
  max?: number
  step?: string
  className?: string
  disabled?: boolean
}

export function FormInput({ 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  min, 
  max, 
  step, 
  className,
  disabled 
}: FormInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className={cn(
        'w-full px-4 py-3 bg-surface0 border border-surface1 rounded-xl text-text',
        'focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    />
  )
}

interface FormTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
  disabled?: boolean
}

export function FormTextarea({ 
  value, 
  onChange, 
  placeholder, 
  rows = 3, 
  className,
  disabled 
}: FormTextareaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={cn(
        'w-full px-4 py-3 bg-surface0 border border-surface1 rounded-xl text-text',
        'focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent resize-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    />
  )
}

interface FormSelectProps {
  value: string
  onChange: (value: string) => void
  children: ReactNode
  className?: string
  disabled?: boolean
}

export function FormSelect({ value, onChange, children, className, disabled }: FormSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        'w-full px-4 py-3 bg-surface0 border border-surface1 rounded-xl text-text',
        'focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {children}
    </select>
  )
}