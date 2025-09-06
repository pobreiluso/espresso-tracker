'use client'

import { useState } from 'react'
import { Camera, Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AddBagFromPhoto from './AddBagFromPhoto'

export default function FloatingActionButton() {
  const [showAddBag, setShowAddBag] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()

  const handleBagAdded = () => {
    setShowAddBag(false)
    // Refresh the current page to show new bag
    window.location.reload()
  }

  return (
    <>
      {/* Main FAB */}
      <div className="fixed bottom-20 right-4 md:hidden z-40">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
            showMenu 
              ? 'bg-red text-white rotate-45' 
              : 'bg-primary text-white hover:scale-105'
          }`}
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Quick Actions Menu */}
      {showMenu && (
        <div className="fixed bottom-36 right-4 md:hidden z-40">
          <div className="flex flex-col space-y-3">
            {/* Add from Photo */}
            <button
              onClick={() => {
                setShowAddBag(true)
                setShowMenu(false)
              }}
              className="w-12 h-12 bg-green text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <Camera className="w-5 h-5" />
            </button>
            <span className="text-xs text-subtext1 text-center">Photo</span>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showMenu && (
        <div
          className="fixed inset-0 bg-black/10 md:hidden z-30"
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Add Bag Modal */}
      {showAddBag && (
        <AddBagFromPhoto onSuccess={handleBagAdded} />
      )}
    </>
  )
}