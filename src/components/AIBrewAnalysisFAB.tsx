'use client'

import { useState } from 'react'
import { Camera, Coffee } from 'lucide-react'
import { AddBrewWithAnalysis } from './AddBrewWithAnalysis'

export function AIBrewAnalysisFAB() {
  const [showAnalysis, setShowAnalysis] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowAnalysis(true)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 bg-gradient-to-r from-peach to-rosewater rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group hover:scale-110"
        aria-label="Análisis de Extracción"
      >
        <div className="relative">
          <Camera className="h-6 w-6 text-base group-hover:scale-110 transition-transform" />
          <Coffee className="h-3 w-3 text-base absolute -top-1 -right-1" />
        </div>
      </button>

      {showAnalysis && (
        <AddBrewWithAnalysis
          onClose={() => setShowAnalysis(false)}
          onSuccess={() => {
            // Could trigger a refresh of the brews list here
            console.log('Brew analysis saved successfully')
          }}
        />
      )}
    </>
  )
}