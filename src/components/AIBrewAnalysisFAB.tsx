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
        className="fixed bottom-44 right-4 z-40 w-12 h-12 bg-gradient-to-r from-blue to-sapphire rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group hover:scale-110"
        aria-label="Análisis de Extracción"
        title="Análisis IA de café extraído"
      >
        <div className="relative">
          <Camera className="h-5 w-5 text-base group-hover:scale-110 transition-transform" />
          <Coffee className="h-2.5 w-2.5 text-base absolute -top-0.5 -right-0.5" />
        </div>
      </button>

      {showAnalysis && (
        <AddBrewWithAnalysis
          onClose={() => setShowAnalysis(false)}
          onSuccess={() => {
            console.log('Brew analysis saved successfully')
            setShowAnalysis(false)
            // Trigger a page refresh to update the lists
            window.location.reload()
          }}
        />
      )}
    </>
  )
}