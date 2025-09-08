'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void
  hideToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 4000
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove toast after duration
    setTimeout(() => {
      hideToast(id)
    }, newToast.duration)
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow" />
      case 'info':
        return <Info className="w-5 h-5 text-blue" />
    }
  }

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-green bg-green/5'
      case 'error':
        return 'border-red bg-red/5'
      case 'warning':
        return 'border-yellow bg-yellow/5'
      case 'info':
        return 'border-blue bg-blue/5'
    }
  }

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 max-w-sm w-full space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'p-4 rounded-lg border shadow-lg backdrop-blur-sm',
              'transform transition-all duration-300 ease-out',
              'animate-in slide-in-from-right-full',
              getToastStyles(toast.type)
            )}
          >
            <div className="flex items-start gap-3">
              {getToastIcon(toast.type)}
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-text">
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className="text-sm text-subtext1 mt-1">
                    {toast.message}
                  </p>
                )}
              </div>
              
              <button
                onClick={() => hideToast(toast.id)}
                className="text-subtext1 hover:text-text transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// Convenience hooks for different toast types
export const useSuccessToast = () => {
  const { showToast } = useToast()
  return useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message })
  }, [showToast])
}

export const useErrorToast = () => {
  const { showToast } = useToast()
  return useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message })
  }, [showToast])
}

export const useWarningToast = () => {
  const { showToast } = useToast()
  return useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message })
  }, [showToast])
}

export const useInfoToast = () => {
  const { showToast } = useToast()
  return useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message })
  }, [showToast])
}