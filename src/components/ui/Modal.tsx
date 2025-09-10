'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: React.ReactNode
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full'
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'lg',
  className 
}: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-base/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={cn(
        'bg-mantle rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden',
        maxWidthClasses[maxWidth],
        className
      )}>
        <div className="p-6 border-b border-surface0">
          <div className="flex items-center justify-between">
            {typeof title === 'string' ? (
              <h2 className="text-xl font-semibold text-text">{title}</h2>
            ) : (
              title
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface0 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-subtext0" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>
      </div>
    </div>
  )
}

interface ModalHeaderProps {
  children: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export function ModalHeader({ children, icon, className }: ModalHeaderProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {icon}
      {children}
    </div>
  )
}

interface ModalBodyProps {
  children: React.ReactNode
  className?: string
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  )
}

interface ModalFooterProps {
  children: React.ReactNode
  className?: string
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn(
      'sticky bottom-0 bg-mantle border-t border-surface0 p-4',
      className
    )}>
      {children}
    </div>
  )
}