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
      const constraints = {
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      // More user-friendly error message
      alert('No se pudo acceder a la cámara. Por favor, usa la opción de subir desde la galería.')
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
            {/* Camera controls */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-8">
              {/* Gallery access button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm"
              >
                <Upload className="w-6 h-6" />
              </button>
              
              {/* Capture button */}
              <button
                onClick={takePhoto}
                className="w-20 h-20 bg-white rounded-full border-4 border-primary shadow-lg flex items-center justify-center active:scale-95 transition-transform"
              >
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </button>
              
              {/* Flash/settings placeholder */}
              <div className="w-12 h-12"></div>
            </div>

            {/* Close button */}
            <button
              onClick={stopCamera}
              className="absolute top-4 left-4 bg-black/50 text-white p-3 rounded-full backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Camera overlay guide */}
            <div className="absolute inset-4 border-2 border-white/30 rounded-lg flex items-center justify-center">
              <div className="bg-black/50 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
                Centra la etiqueta del café en el marco
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-xl font-semibold text-center">
              Fotografía tu café
            </h3>
            <p className="text-subtext1 text-center max-w-md text-sm leading-relaxed">
              Nuestra IA extraerá automáticamente el tostador, nombre del café, origen, fecha de tueste y otros detalles desde la foto.
            </p>
            
            <div className="space-y-3 w-full max-w-sm">
              <button
                onClick={startCamera}
                disabled={loading}
                className="btn btn-primary w-full flex items-center justify-center gap-3 h-14 text-base font-medium"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
                Abrir Cámara
              </button>
              
              <div className="relative">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary w-full flex items-center justify-center gap-3 h-12 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Subir desde Galería
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            <div className="text-xs text-subtext0 text-center max-w-sm">
              💡 <strong>Consejo:</strong> Asegúrate de que la etiqueta esté bien iluminada y enfocada para mejores resultados
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}