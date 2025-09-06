'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, X, Loader2 } from 'lucide-react'

interface PhotoCaptureProps {
  onPhotoTaken: (file: File) => void
  onCancel: () => void
}

export default function PhotoCapture({ onPhotoTaken, onCancel }: PhotoCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraActive, setCameraActive] = useState(false)

  const startCamera = async () => {
    try {
      setLoading(true)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Could not access camera. Please use file upload instead.')
    } finally {
      setLoading(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
    }
    setCameraActive(false)
  }

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'coffee-bag.jpg', { type: 'image/jpeg' })
          setPreview(canvas.toDataURL())
          stopCamera()
          onPhotoTaken(file)
        }
      }, 'image/jpeg', 0.8)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      onPhotoTaken(file)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-overlay0">
        <h2 className="text-lg font-semibold">Add Coffee Bag Photo</h2>
        <button onClick={onCancel} className="p-2">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {cameraActive ? (
          <div className="flex-1 relative">
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <button
                onClick={takePhoto}
                className="w-16 h-16 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center"
              >
                <Camera className="w-8 h-8 text-white" />
              </button>
            </div>
            <button
              onClick={stopCamera}
              className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-xl font-semibold text-center">
              Take a photo of your coffee bag
            </h3>
            <p className="text-subtext1 text-center max-w-md">
              Our AI will automatically extract the roaster, coffee name, origin, roast date, and other details from the photo.
            </p>
            
            <div className="space-y-4 w-full max-w-sm">
              <button
                onClick={startCamera}
                disabled={loading}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                Open Camera
              </button>
              
              <div className="relative">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload from Gallery
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}