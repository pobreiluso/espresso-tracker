'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, Upload, Coffee, Clock, Settings, Send, X } from 'lucide-react'
import { getOpenBags } from '@/lib/queries'
import { BagWithCoffeeAndRoaster, CreateBrewWithAnalysisForm, BrewAnalysis } from '@/types'
import { supabase } from '@/lib/supabase'
import { uploadPhoto, generatePhotoFilename, compressImage } from '@/lib/storage'
import { useSettings } from '@/lib/useSettings'

interface AddBrewWithAnalysisProps {
  onClose: () => void
  onSuccess: () => void
}

export function AddBrewWithAnalysis({ onClose, onSuccess }: AddBrewWithAnalysisProps) {
  const { settings } = useSettings()
  const [step, setStep] = useState<'form' | 'photo' | 'analyzing' | 'results'>('form')
  const [openBags, setOpenBags] = useState<BagWithCoffeeAndRoaster[]>([])
  const [selectedBagId, setSelectedBagId] = useState<string>('')
  const [grindSetting, setGrindSetting] = useState<number | ''>(settings.defaultGrindSetting || '')
  const [extractionTime, setExtractionTime] = useState<number | ''>('')
  const [doseGrams, setDoseGrams] = useState<number | ''>(settings.defaultDoseG || '')
  const [yieldGrams, setYieldGrams] = useState<number | ''>('')
  const [waterTemp, setWaterTemp] = useState<number | ''>(settings.defaultWaterTempC || '')
  const [rating, setRating] = useState<number>(5)
  const [notes, setNotes] = useState<string>('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<BrewAnalysis | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Load open bags on component mount
  useState(() => {
    getOpenBags().then(setOpenBags).catch(console.error)
  })

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setStep('photo')
    }
  }

  const analyzePhoto = async () => {
    if (!photo) return

    setStep('analyzing')
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', photo)
      
      // Add brew parameters as context for analysis
      const brewContext = {
        grind_setting: grindSetting,
        extraction_time: extractionTime,
        dose_grams: doseGrams,
        yield_grams: yieldGrams,
        water_temp: waterTemp,
        ratio: doseGrams && yieldGrams ? yieldGrams / doseGrams : null
      }
      
      formData.append('brew_data', JSON.stringify(brewContext))

      const response = await fetch('/api/analyze-brew', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to analyze photo')
      }

      const analysisResult = await response.json()
      setAnalysis(analysisResult)
      setStep('results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error analyzing photo')
      setStep('photo')
    }
  }

  const submitBrew = async () => {
    if (!selectedBagId) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Upload photo first
      let photoUrl: string | null = null
      if (photo) {
        const filename = generatePhotoFilename('brew', 'jpg')
        const path = `brews/${filename}`
        
        // Compress the image before upload
        const compressedFile = await compressImage(photo)
        const uploadResult = await uploadPhoto(compressedFile, 'brew-photos', path)
        
        if (uploadResult.error) {
          setError(`Error uploading photo: ${uploadResult.error}`)
          return
        }
        
        photoUrl = uploadResult.url
      }

      // Create brew record with or without analysis data
      let mappedMethod = 'v60' // default method
      
      if (analysis) {
        // Map detected method to valid values when analysis is available
        const detectedMethod = analysis.brewing_method.detected_method?.toLowerCase()
        if (detectedMethod?.includes('pour') || detectedMethod?.includes('v60')) mappedMethod = 'v60'
        else if (detectedMethod?.includes('espresso')) mappedMethod = 'espresso'
        else if (detectedMethod?.includes('aeropress')) mappedMethod = 'aeropress'
        else if (detectedMethod?.includes('chemex')) mappedMethod = 'chemex'
        else if (detectedMethod?.includes('kalita')) mappedMethod = 'kalita'
        else if (detectedMethod?.includes('french') || detectedMethod?.includes('press')) mappedMethod = 'frenchpress'
      }

      const brewData = {
        bag_id: selectedBagId,
        method: mappedMethod,
        dose_g: Math.max(5, Math.min(30, doseGrams || 18)), // Ensure within 5-30 range
        yield_g: yieldGrams || (analysis?.volume_estimation.estimated_ml) || 30,
        time_s: Math.max(5, Math.min(90, extractionTime || 25)), // Ensure within 5-90 range
        grind_setting: grindSetting ? String(grindSetting) : 'medium',
        water_temp_c: Math.max(80, Math.min(100, waterTemp || 93)), // Ensure within 80-100 range
        rating: Math.max(1, Math.min(10, rating)), // Ensure within 1-10 range
        notes: notes || (analysis ? analysis.quality_assessment.recommendations.join('. ') : ''),
        brew_date: new Date().toISOString(), // Full timestamp
        
        // Analysis fields (null if no analysis)
        extraction_time_seconds: extractionTime || null,
        dose_grams: doseGrams || null,
        yield_grams: yieldGrams || null,
        water_temp_celsius: waterTemp || null,
        ai_analysis: analysis || null,
        extraction_quality: analysis?.extraction_analysis.quality || null,
        brewing_method_detected: analysis?.brewing_method.detected_method || null,
        estimated_volume_ml: analysis?.volume_estimation.estimated_ml || null,
        visual_score: analysis?.quality_assessment.overall_score || null,
        confidence_score: analysis?.confidence_overall || null,
        photo_url: photoUrl,
        has_photo: !!photoUrl,
        has_ai_analysis: !!analysis,
        user_id: '00000000-0000-0000-0000-000000000000' // Dummy user ID for dev
      }

      console.log('Inserting brew data:', brewData)
      
      const { error: insertError } = await supabase
        .from('brews')
        .insert(brewData)

      if (insertError) {
        console.error('Supabase insert error:', insertError)
        throw new Error(`Database error: ${insertError.message}`)
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving brew')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedBag = openBags.find(bag => bag.id === selectedBagId)

  return (
    <div className="fixed inset-0 bg-base/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-mantle rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-surface0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text flex items-center gap-2">
              <Coffee className="h-5 w-5 text-peach" />
              Análisis de Extracción
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface0 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-subtext0" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-4 p-3 bg-red/10 border border-red/20 rounded-lg">
              <p className="text-red text-sm">{error}</p>
            </div>
          )}

          {step === 'form' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Bolsa de Café *
                </label>
                <select
                  value={selectedBagId}
                  onChange={(e) => setSelectedBagId(e.target.value)}
                  className="w-full px-4 py-3 bg-surface0 border border-surface1 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar bolsa...</option>
                  {openBags.map((bag) => (
                    <option key={bag.id} value={bag.id}>
                      {bag.coffee.roaster.name} - {bag.coffee.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    <Settings className="inline h-4 w-4 mr-1" />
                    Ajuste Molino
                  </label>
                  <input
                    type="number"
                    value={grindSetting}
                    onChange={(e) => setGrindSetting(e.target.value ? Number(e.target.value) : '')}
                    placeholder="ej. 15"
                    className="w-full px-4 py-3 bg-surface0 border border-surface1 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Tiempo (seg)
                  </label>
                  <input
                    type="number"
                    value={extractionTime}
                    onChange={(e) => setExtractionTime(e.target.value ? Number(e.target.value) : '')}
                    placeholder="ej. 25"
                    className="w-full px-4 py-3 bg-surface0 border border-surface1 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Dosis (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={doseGrams}
                    onChange={(e) => setDoseGrams(e.target.value ? Number(e.target.value) : '')}
                    placeholder="ej. 18.5"
                    className="w-full px-4 py-3 bg-surface0 border border-surface1 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Rendimiento (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={yieldGrams}
                    onChange={(e) => setYieldGrams(e.target.value ? Number(e.target.value) : '')}
                    placeholder="ej. 37.0"
                    className="w-full px-4 py-3 bg-surface0 border border-surface1 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Temperatura Agua (°C)
                </label>
                <input
                  type="number"
                  value={waterTemp}
                  onChange={(e) => setWaterTemp(e.target.value ? Number(e.target.value) : '')}
                  placeholder="ej. 93"
                  className="w-full px-4 py-3 bg-surface0 border border-surface1 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Calificación (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full accent-peach"
                />
                <div className="text-center text-peach font-medium">{rating}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Notas
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Sabores, aromas, observaciones..."
                  className="w-full px-4 py-3 bg-surface0 border border-surface1 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-peach focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-text">Foto del Café Extraído (Opcional)</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-peach text-base rounded-xl hover:bg-peach/90 transition-colors"
                  >
                    <Camera className="h-5 w-5" />
                    Tomar Foto
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-surface1 text-text rounded-xl hover:bg-surface2 transition-colors"
                  >
                    <Upload className="h-5 w-5" />
                    Subir Foto
                  </button>
                </div>
                <button
                  onClick={() => setStep('results')}
                  className="w-full py-3 px-4 bg-surface0 text-subtext0 rounded-xl hover:bg-surface1 transition-colors border border-surface1"
                >
                  Continuar sin foto
                </button>
                
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoCapture}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoCapture}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {step === 'photo' && photoPreview && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium text-text mb-2">Vista Previa</h3>
                <p className="text-subtext0 text-sm">Verifica que la foto muestre claramente el café extraído</p>
              </div>
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl border border-surface1"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPhoto(null)
                    setPhotoPreview(null)
                    setStep('form')
                  }}
                  className="flex-1 py-3 px-4 bg-surface1 text-text rounded-xl hover:bg-surface2 transition-colors"
                >
                  Cambiar Foto
                </button>
                <button
                  onClick={analyzePhoto}
                  className="flex-1 py-3 px-4 bg-peach text-base rounded-xl hover:bg-peach/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Analizar
                </button>
              </div>
            </div>
          )}

          {step === 'analyzing' && (
            <div className="text-center space-y-4">
              <div className="animate-spin h-12 w-12 border-4 border-surface1 border-t-peach rounded-full mx-auto"></div>
              <h3 className="text-lg font-medium text-text">Analizando Extracción</h3>
              <p className="text-subtext0">La IA está evaluando la calidad de tu café...</p>
            </div>
          )}

          {step === 'results' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-text mb-2">
                  {analysis ? 'Análisis Completado' : 'Guardar Café'}
                </h3>
                {selectedBag && (
                  <p className="text-subtext0 text-sm">
                    {selectedBag.coffee.roaster.name} - {selectedBag.coffee.name}
                  </p>
                )}
              </div>

              {analysis ? (
                <>
                  <div className="bg-surface0 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text font-medium">Calidad de Extracción</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    analysis.extraction_analysis.quality === 'properly-extracted' 
                      ? 'bg-green/20 text-green'
                      : analysis.extraction_analysis.quality === 'over-extracted'
                      ? 'bg-red/20 text-red'
                      : 'bg-yellow/20 text-yellow'
                  }`}>
                    {analysis.extraction_analysis.quality === 'properly-extracted' ? 'Óptima' :
                     analysis.extraction_analysis.quality === 'over-extracted' ? 'Sobre-extraída' : 'Sub-extraída'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text">Método Detectado</span>
                  <span className="text-peach capitalize">{analysis.brewing_method.detected_method}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text">Volumen Estimado</span>
                  <span className="text-peach">{analysis.volume_estimation.estimated_ml} ml</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text">Puntuación Visual</span>
                  <span className="text-peach">{analysis.quality_assessment.overall_score}/10</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text">Confianza del Análisis</span>
                  <span className="text-peach">{Math.round(analysis.confidence_overall * 100)}%</span>
                </div>
              </div>

              {analysis.crema_analysis.present && (
                <div className="bg-surface0 rounded-xl p-4">
                  <h4 className="text-text font-medium mb-3">Análisis de Crema</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-subtext0">Color</span>
                      <span className="text-text capitalize">{analysis.crema_analysis.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-subtext0">Grosor</span>
                      <span className="text-text capitalize">{analysis.crema_analysis.thickness}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-subtext0">Cobertura</span>
                      <span className="text-text capitalize">{analysis.crema_analysis.coverage}</span>
                    </div>
                  </div>
                </div>
              )}

              {analysis.quality_assessment.recommendations.length > 0 && (
                <div className="bg-surface0 rounded-xl p-4">
                  <h4 className="text-text font-medium mb-3">Recomendaciones</h4>
                  <ul className="space-y-2">
                    {analysis.quality_assessment.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-subtext0 flex items-start gap-2">
                        <span className="text-peach">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
                </>
              ) : (
                <div className="bg-surface0 rounded-xl p-4 text-center">
                  <p className="text-subtext0 text-sm mb-4">
                    Se guardará el café sin análisis de IA. Puedes añadir una foto y análisis después si lo deseas.
                  </p>
                  <button
                    onClick={() => setStep('form')}
                    className="text-peach text-sm hover:underline"
                  >
                    ← Volver atrás
                  </button>
                </div>
              )}

              <button
                onClick={submitBrew}
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-peach text-base rounded-xl hover:bg-peach/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-base border-t-transparent rounded-full"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Coffee className="h-4 w-4" />
                    Guardar Análisis
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}