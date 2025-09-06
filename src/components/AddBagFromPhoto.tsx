'use client'

import { useState } from 'react'
import PhotoCapture from './PhotoCapture'
import { Camera, Loader2, Check, X, Edit } from 'lucide-react'
import { extractBagInfoFromImage, processBagFromPhoto, ExtractedBagInfo } from '@/lib/bags'

interface AddBagFromPhotoProps {
  onSuccess?: () => void
}

type Step = 'initial' | 'capture' | 'processing' | 'review' | 'saving' | 'success' | 'error'

export default function AddBagFromPhoto({ onSuccess }: AddBagFromPhotoProps) {
  const [step, setStep] = useState<Step>('initial')
  const [extractedInfo, setExtractedInfo] = useState<ExtractedBagInfo | null>(null)
  const [error, setError] = useState<string>('')
  const [editedInfo, setEditedInfo] = useState<ExtractedBagInfo | null>(null)

  const handlePhotoTaken = async (file: File) => {
    setStep('processing')
    setError('')

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
    if (!editedInfo) return

    setStep('saving')
    try {
      const result = await processBagFromPhoto(editedInfo)
      if (result.success) {
        setStep('success')
        setTimeout(() => {
          setStep('initial')
          onSuccess?.()
        }, 2000)
      } else {
        setError(result.error || 'Failed to save bag')
        setStep('error')
      }
    } catch (err) {
      setError('Failed to save bag. Please try again.')
      setStep('error')
    }
  }

  const handleCancel = () => {
    setStep('initial')
    setExtractedInfo(null)
    setEditedInfo(null)
    setError('')
  }

  const updateField = (section: keyof ExtractedBagInfo, field: string, value: any) => {
    if (!editedInfo) return
    
    setEditedInfo(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value
      }
    }))
  }

  if (step === 'initial') {
    return (
      <button 
        onClick={() => setStep('capture')}
        className="btn btn-primary flex items-center gap-2"
      >
        <Camera className="w-4 h-4" />
        Add from Photo
      </button>
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
        <div className="p-4 border-b border-overlay0 flex items-center justify-between sticky top-0 bg-background">
          <h2 className="text-lg font-semibold">Review & Confirm</h2>
          <button onClick={handleCancel}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Confidence indicator */}
          <div className="card p-4">
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

          {/* Roaster info */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold">Roaster</h3>
              <Edit className="w-4 h-4 text-subtext1" />
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input 
                  value={editedInfo.roaster.name}
                  onChange={(e) => updateField('roaster', 'name', e.target.value)}
                  className="input w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <input 
                    value={editedInfo.roaster.country || ''}
                    onChange={(e) => updateField('roaster', 'country', e.target.value)}
                    className="input w-full"
                    placeholder="e.g. United States"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Founded Year</label>
                  <input 
                    type="number"
                    value={editedInfo.roaster.founded_year || ''}
                    onChange={(e) => updateField('roaster', 'founded_year', e.target.value ? parseInt(e.target.value) : null)}
                    className="input w-full"
                    placeholder="e.g. 2002"
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
                    placeholder="e.g. Third Wave"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Size</label>
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
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  value={editedInfo.roaster.description || ''}
                  onChange={(e) => updateField('roaster', 'description', e.target.value)}
                  className="input w-full h-20 resize-none"
                  placeholder="Brief description of the roaster..."
                />
              </div>
            </div>
          </div>

          {/* Coffee info */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold">Coffee</h3>
              <Edit className="w-4 h-4 text-subtext1" />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input 
                  value={editedInfo.coffee.name}
                  onChange={(e) => updateField('coffee', 'name', e.target.value)}
                  className="input w-full"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Origin Country</label>
                  <input 
                    value={editedInfo.coffee.origin_country || ''}
                    onChange={(e) => updateField('coffee', 'origin_country', e.target.value)}
                    className="input w-full"
                    placeholder="e.g. Ethiopia"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Region</label>
                  <input 
                    value={editedInfo.coffee.region || ''}
                    onChange={(e) => updateField('coffee', 'region', e.target.value)}
                    className="input w-full"
                    placeholder="e.g. Sidama"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Farm/Station</label>
                  <input 
                    value={editedInfo.coffee.farm || ''}
                    onChange={(e) => updateField('coffee', 'farm', e.target.value)}
                    className="input w-full"
                    placeholder="e.g. Bensa Washing Station"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Producer</label>
                  <input 
                    value={editedInfo.coffee.producer || ''}
                    onChange={(e) => updateField('coffee', 'producer', e.target.value)}
                    className="input w-full"
                    placeholder="e.g. Local Farmers"
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
                    placeholder="e.g. Heirloom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Process</label>
                  <input 
                    value={editedInfo.coffee.process || ''}
                    onChange={(e) => updateField('coffee', 'process', e.target.value)}
                    className="input w-full"
                    placeholder="e.g. Washed"
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
                    value={editedInfo.coffee.cupping_score || ''}
                    onChange={(e) => updateField('coffee', 'cupping_score', e.target.value ? parseFloat(e.target.value) : null)}
                    className="input w-full"
                    placeholder="86.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Harvest Season</label>
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
                  placeholder="e.g. Organic, Fair Trade"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tasting Notes</label>
                <textarea 
                  value={editedInfo.coffee.tasting_notes || ''}
                  onChange={(e) => updateField('coffee', 'tasting_notes', e.target.value)}
                  className="input w-full h-20 resize-none"
                  placeholder="e.g. Blueberry, dark chocolate, bright citrus acidity..."
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
                    className="input w-full h-24 resize-none"
                    placeholder="Background story about the coffee..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bag info */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold">Bag Details</h3>
              <Edit className="w-4 h-4 text-subtext1" />
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Size (g)</label>
                  <input 
                    type="number"
                    value={editedInfo.bag.size_g}
                    onChange={(e) => updateField('bag', 'size_g', parseInt(e.target.value))}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={editedInfo.bag.price || ''}
                    onChange={(e) => updateField('bag', 'price', e.target.value ? parseFloat(e.target.value) : null)}
                    className="input w-full"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Roast Date</label>
                <input 
                  type="date"
                  value={editedInfo.bag.roast_date || ''}
                  onChange={(e) => updateField('bag', 'roast_date', e.target.value)}
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <button 
              onClick={handleCancel}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Save Bag
            </button>
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
          <button 
            onClick={handleCancel}
            className="btn btn-secondary w-full"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return null
}