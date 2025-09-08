'use client'

import { useState } from 'react'
import { Camera, Plus } from 'lucide-react'
import AddBagFromPhoto from './AddBagFromPhoto'
import { Button } from './ui/Button'

export default function FloatingActionButton() {
  const [showAddBag, setShowAddBag] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleBagAdded = () => {
    setIsSuccess(true)
    // Show success animation briefly
    setTimeout(() => {
      setShowAddBag(false)
      setIsSuccess(false)
      // Instead of reload, emit custom event to refresh data
      window.dispatchEvent(new CustomEvent('bagAdded'))
    }, 1000)
  }

  const handleOpenModal = () => {
    setShowAddBag(true)
    setIsSuccess(false)
  }

  return (
    <>
      {/* Enhanced FAB with better animations */}
      <div className="fixed bottom-24 right-4 md:hidden z-40">
        <div className="relative">
          {/* Success ripple animation */}
          {isSuccess && (
            <div className="absolute inset-0 rounded-full bg-green animate-ping opacity-75"></div>
          )}
          
          <button
            onClick={handleOpenModal}
            className="relative w-16 h-16 bg-peach hover:bg-peach/90 active:bg-peach/95 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group touch-manipulation"
            title="Añadir bolsa de café"
            disabled={showAddBag}
          >
            {isSuccess ? (
              <Plus className="w-7 h-7 text-base rotate-45 transition-transform duration-300" />
            ) : (
              <Camera className="w-7 h-7 text-base group-hover:scale-110 transition-transform duration-200" />
            )}
          </button>

          {/* Floating label for better UX */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-surface1 text-text text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap border border-surface2">
              Añadir bolsa
            </div>
          </div>
        </div>
      </div>

      {/* Add Bag Modal */}
      {showAddBag && (
        <AddBagFromPhoto onSuccess={handleBagAdded} />
      )}
    </>
  )
}