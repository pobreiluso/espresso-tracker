'use client'

import { useState } from 'react'
import { Camera } from 'lucide-react'
import AddBagFromPhoto from './AddBagFromPhoto'

export default function FloatingActionButton() {
  const [showAddBag, setShowAddBag] = useState(false)

  const handleBagAdded = () => {
    setShowAddBag(false)
    // Refresh the current page to show new bag
    window.location.reload()
  }

  return (
    <>
      {/* Main FAB */}
      <div className="fixed bottom-24 right-4 md:hidden z-40">
        <button
          onClick={() => setShowAddBag(true)}
          className="w-16 h-16 bg-gradient-to-r from-peach to-rosewater rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 group"
          title="Añadir bolsa de café"
        >
          <Camera className="w-7 h-7 text-base group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Add Bag Modal */}
      {showAddBag && (
        <AddBagFromPhoto onSuccess={handleBagAdded} />
      )}
    </>
  )
}