'use client'

import { useState } from 'react'
import PhotoCapture from './PhotoCapture'
import { Camera, Loader2, Check, X, Edit, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from './ui/Button'
import { extractBagInfoFromImage, processBagFromPhoto, ExtractedBagInfo } from '@/lib/bags'
import { uploadPhoto, compressImage, generatePhotoFilename } from '@/lib/storage'

interface AddBagFromPhotoProps {
  onSuccess?: () => void
}

type Step = 'initial' | 'capture' | 'processing' | 'review' | 'saving' | 'success' | 'error'

export default function AddBagFromPhoto({ onSuccess }: AddBagFromPhotoProps) {
  const [step, setStep] = useState<Step>('initial')
  const [extractedInfo, setExtractedInfo] = useState<ExtractedBagInfo | null>(null)
  const [error, setError] = useState<string>('')
  const [editedInfo, setEditedInfo] = useState<ExtractedBagInfo | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [originalPhoto, setOriginalPhoto] = useState<File | null>(null)

  const handlePhotoTaken = async (file: File) => {
    setStep('processing')
    setError('')
    setOriginalPhoto(file) // Store the original photo

    try {
      const info = await extractBagInfoFromImage(file)
      setExtractedInfo(info)
      setEditedInfo(info) // Initialize edited version with extracted data
      setStep('review')
    } catch (err) {
      setError('Failed to process the image. Please try again or add manually.')
      setStep('error')
    }
  }

  const handleSave = async () => {
    if (!editedInfo || !originalPhoto) return

    setIsSaving(true)
    setStep('saving')
    try {
      // Compress and upload the photo first
      let photoUrl = null
      if (originalPhoto) {
        const compressedFile = await compressImage(originalPhoto)
        const filename = generatePhotoFilename('bag')
        const path = `bags/${filename}`
        
        const uploadResult = await uploadPhoto(compressedFile, 'bag-photos', path)
        if (uploadResult.error) {
          setError(`Failed to upload photo: ${uploadResult.error}`)
          setStep('error')
          return
        }
        photoUrl = uploadResult.url
      }

      const result = await processBagFromPhoto(editedInfo, photoUrl)
      if (result.success) {
        setStep('success')
        setTimeout(() => {
          setStep('initial')
          setOriginalPhoto(null)
          onSuccess?.()
        }, 2000)
      } else {
        setError(result.error || 'Failed to save bag')
        setStep('error')
      }
    } catch (err) {
      setError('Failed to save bag. Please try again.')
      setStep('error')
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setStep('initial')
    setExtractedInfo(null)
    setEditedInfo(null)
    setError('')
    setOriginalPhoto(null)
  }

  const updateField = (section: keyof ExtractedBagInfo, field: string, value: any) => {
    if (!editedInfo) return
    
    setEditedInfo(prev => {
      if (!prev) return prev
      return {
        ...prev,
        [section]: {
          ...prev[section] as any,
          [field]: value
        }
      }
    })
  }

  if (step === 'initial') {
    return (
      <Button
        onClick={() => setStep('capture')}
        variant="primary"
        size="md"
        icon={<Camera className="w-4 h-4" />}
        fullWidth
      >
        📸 Foto
      </Button>
    )
  }

  if (step === 'capture') {
    return (
      <PhotoCapture 
        onPhotoTaken={handlePhotoTaken}
        onCancel={handleCancel}
      />
    )
  }

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg p-8 text-center max-w-sm w-full">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Processing image...</h3>
          <p className="text-subtext1">Our AI is extracting coffee bag information</p>
        </div>
      </div>
    )
  }

  if (step === 'review' && editedInfo) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
        <div className="p-4 border-b border-overlay0 flex items-center justify-between sticky top-0 bg-background z-10">
          <h2 className="text-lg font-semibold">Revisar y Guardar</h2>
          <button onClick={handleCancel} className="p-2 -mr-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Confidence indicator */}
          <div className="card p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Detection Confidence</span>
              <span className={`px-2 py-1 rounded text-xs ${
                editedInfo.confidence > 0.8 ? 'bg-green/20 text-green' :
                editedInfo.confidence > 0.6 ? 'bg-yellow/20 text-yellow' :
                'bg-red/20 text-red'
              }`}>
                {Math.round(editedInfo.confidence * 100)}%
              </span>
            </div>
          </div>

          {/* Quick Essential Fields */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-subtext0 uppercase tracking-wide mb-4">Información Básica</h3>
            <div className="space-y-4">
              {/* Full width inputs for better mobile experience */}
              <div>
                <label className="block text-sm font-medium mb-2">Tostador</label>
                <input 
                  value={editedInfo.roaster.name}
                  onChange={(e) => updateField('roaster', 'name', e.target.value)}
                  className="input w-full h-12 text-base"
                  placeholder="Nombre del tostador"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Nombre del Café</label>
                <input 
                  value={editedInfo.coffee.name}
                  onChange={(e) => updateField('coffee', 'name', e.target.value)}
                  className="input w-full h-12 text-base"
                  placeholder="Nombre del café"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Origen</label>
                  <input 
                    value={editedInfo.coffee.origin_country || ''}
                    onChange={(e) => updateField('coffee', 'origin_country', e.target.value)}
                    className="input w-full h-12 text-base"
                    placeholder="ej. Etiopía"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tamaño (g)</label>
                  <input 
                    type="number"
                    inputMode="numeric"
                    value={editedInfo.bag.size_g}
                    onChange={(e) => updateField('bag', 'size_g', parseInt(e.target.value) || 0)}
                    className="input w-full h-12 text-base"
                    placeholder="250"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Precio (€)</label>
                  <input 
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={editedInfo.bag.price || ''}
                    onChange={(e) => updateField('bag', 'price', e.target.value ? parseFloat(e.target.value) : null)}
                    className="input w-full h-12 text-base"
                    placeholder="15.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Fecha de Tueste</label>
                  <input 
                    type="date"
                    value={editedInfo.bag.roast_date || ''}
                    onChange={(e) => updateField('bag', 'roast_date', e.target.value)}
                    className="input w-full h-12 text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* More Details Collapsible Section */}
          <div className="card">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full p-4 flex items-center justify-between text-left border-b border-overlay0 hover:bg-surface0 transition-colors"
            >
              <span className="font-medium">More Details</span>
              {showDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            
            {showDetails && (
              <div className="p-4 space-y-6">
                {/* Roaster Details */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-subtext0 uppercase tracking-wide">Roaster Details</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Country</label>
                        <input 
                          value={editedInfo.roaster.country || ''}
                          onChange={(e) => updateField('roaster', 'country', e.target.value)}
                          className="input w-full"
                          placeholder="United States"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Founded</label>
                        <input 
                          type="number"
                          value={editedInfo.roaster.founded_year || ''}
                          onChange={(e) => updateField('roaster', 'founded_year', e.target.value ? parseInt(e.target.value) : null)}
                          className="input w-full"
                          placeholder="2002"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Specialty</label>
                        <input 
                          value={editedInfo.roaster.specialty || ''}
                          onChange={(e) => updateField('roaster', 'specialty', e.target.value)}
                          className="input w-full"
                          placeholder="Third Wave"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Size Category</label>
                        <select 
                          value={editedInfo.roaster.size_category || ''}
                          onChange={(e) => updateField('roaster', 'size_category', e.target.value)}
                          className="input w-full"
                        >
                          <option value="">Select size</option>
                          <option value="Micro">Micro</option>
                          <option value="Small">Small</option>
                          <option value="Medium">Medium</option>
                          <option value="Large">Large</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Website</label>
                      <input 
                        type="url"
                        value={editedInfo.roaster.website || ''}
                        onChange={(e) => updateField('roaster', 'website', e.target.value)}
                        className="input w-full"
                        placeholder="https://..."
                      />
                    </div>
                    {editedInfo.roaster.description && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea 
                          value={editedInfo.roaster.description || ''}
                          onChange={(e) => updateField('roaster', 'description', e.target.value)}
                          className="input w-full h-16 resize-none text-sm"
                          placeholder="Brief description..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Coffee Details */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-subtext0 uppercase tracking-wide">Coffee Details</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Region</label>
                        <input 
                          value={editedInfo.coffee.region || ''}
                          onChange={(e) => updateField('coffee', 'region', e.target.value)}
                          className="input w-full"
                          placeholder="Sidama"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Farm/Station</label>
                        <input 
                          value={editedInfo.coffee.farm || ''}
                          onChange={(e) => updateField('coffee', 'farm', e.target.value)}
                          className="input w-full"
                          placeholder="Bensa Washing Station"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Variety</label>
                        <input 
                          value={editedInfo.coffee.variety || ''}
                          onChange={(e) => updateField('coffee', 'variety', e.target.value)}
                          className="input w-full"
                          placeholder="Heirloom"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Process</label>
                        <input 
                          value={editedInfo.coffee.process || ''}
                          onChange={(e) => updateField('coffee', 'process', e.target.value)}
                          className="input w-full"
                          placeholder="Washed"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Altitude (m)</label>
                        <input 
                          type="number"
                          value={editedInfo.coffee.altitude || ''}
                          onChange={(e) => updateField('coffee', 'altitude', e.target.value ? parseInt(e.target.value) : null)}
                          className="input w-full"
                          placeholder="1900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Cupping Score</label>
                        <input 
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={editedInfo.coffee.cupping_score || ''}
                          onChange={(e) => updateField('coffee', 'cupping_score', e.target.value ? parseFloat(e.target.value) : null)}
                          className="input w-full"
                          placeholder="86.5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Harvest</label>
                        <input 
                          value={editedInfo.coffee.harvest_season || ''}
                          onChange={(e) => updateField('coffee', 'harvest_season', e.target.value)}
                          className="input w-full"
                          placeholder="Oct-Feb"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Certifications</label>
                      <input 
                        value={editedInfo.coffee.certification || ''}
                        onChange={(e) => updateField('coffee', 'certification', e.target.value)}
                        className="input w-full"
                        placeholder="Organic, Fair Trade"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tasting Notes</label>
                      <textarea 
                        value={editedInfo.coffee.tasting_notes || ''}
                        onChange={(e) => updateField('coffee', 'tasting_notes', e.target.value)}
                        className="input w-full h-16 resize-none text-sm"
                        placeholder="Blueberry, dark chocolate, bright citrus acidity..."
                      />
                    </div>
                    {editedInfo.coffee.flavor_profile && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Flavor Profile (1-10)</label>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-subtext1 mb-1">Acidity</label>
                            <input 
                              type="number"
                              min="1"
                              max="10"
                              value={editedInfo.coffee.flavor_profile.acidity || ''}
                              onChange={(e) => updateField('coffee', 'flavor_profile', {
                                ...editedInfo.coffee.flavor_profile,
                                acidity: e.target.value ? parseInt(e.target.value) : null
                              })}
                              className="input w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-subtext1 mb-1">Body</label>
                            <input 
                              type="number"
                              min="1"
                              max="10"
                              value={editedInfo.coffee.flavor_profile.body || ''}
                              onChange={(e) => updateField('coffee', 'flavor_profile', {
                                ...editedInfo.coffee.flavor_profile,
                                body: e.target.value ? parseInt(e.target.value) : null
                              })}
                              className="input w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-subtext1 mb-1">Sweetness</label>
                            <input 
                              type="number"
                              min="1"
                              max="10"
                              value={editedInfo.coffee.flavor_profile.sweetness || ''}
                              onChange={(e) => updateField('coffee', 'flavor_profile', {
                                ...editedInfo.coffee.flavor_profile,
                                sweetness: e.target.value ? parseInt(e.target.value) : null
                              })}
                              className="input w-full"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {editedInfo.coffee.coffee_story && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Coffee Story</label>
                        <textarea 
                          value={editedInfo.coffee.coffee_story || ''}
                          onChange={(e) => updateField('coffee', 'coffee_story', e.target.value)}
                          className="input w-full h-20 resize-none text-sm"
                          placeholder="Background story about the coffee..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Bag Details */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-subtext0 uppercase tracking-wide">Additional Details</h4>
                  <div>
                    <label className="block text-sm font-medium mb-1">Purchase Location</label>
                    <input 
                      value={editedInfo.bag.purchase_location || ''}
                      onChange={(e) => updateField('bag', 'purchase_location', e.target.value)}
                      className="input w-full"
                      placeholder="Coffee shop, online store..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="sticky bottom-0 bg-background border-t border-overlay0 p-4 -mx-4 mt-6">
            <div className="flex gap-3">
              <Button 
                onClick={handleCancel}
                variant="secondary"
                size="lg"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                variant="primary"
                size="lg"
                icon={<Check className="w-5 h-5" />}
                className="flex-1"
                loading={isSaving}
              >
                Guardar Café
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'saving') {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg p-8 text-center max-w-sm w-full">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Saving bag...</h3>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg p-8 text-center max-w-sm w-full">
          <Check className="w-12 h-12 mx-auto mb-4 text-green" />
          <h3 className="text-lg font-semibold mb-2">Success!</h3>
          <p className="text-subtext1">Your coffee bag has been added</p>
        </div>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg p-8 text-center max-w-sm w-full">
          <X className="w-12 h-12 mx-auto mb-4 text-red" />
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p className="text-subtext1 mb-4">{error}</p>
          <Button 
            onClick={handleCancel}
            variant="secondary"
            size="lg"
            fullWidth
          >
            Intentar de Nuevo
          </Button>
        </div>
      </div>
    )
  }

  return null
}