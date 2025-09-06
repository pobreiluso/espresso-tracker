'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, X, Loader2, RotateCcw } from 'lucide-react'

interface CameraCaptureProps {
  onPhotoTaken: (file: File) => void
  onCancel: () => void
  title?: string
  description?: string
}

export default function CameraCapture({ 
  onPhotoTaken, 
  onCancel,
  title = "Tomar Foto",
  description = "Captura una imagen para análisis"
}: CameraCaptureProps) {
  const [cameraActive, setCameraActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startCamera = async () => {
    try {
      setLoading(true)
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported')
      }

      let constraints = {
        video: { 
          facingMode,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        }
      }

      let stream: MediaStream
      
      try {
        // Try with preferred camera
        stream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (preferredError) {
        console.warn(`${facingMode} camera not available, trying fallback:`, preferredError)
        
        // Fallback to opposite camera
        const fallbackMode = facingMode === 'environment' ? 'user' : 'environment'
        constraints = {
          video: { 
            facingMode: fallbackMode,
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 }
          }
        }
        
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints)
          setFacingMode(fallbackMode)
        } catch (fallbackError) {
          console.warn('Fallback camera not available, trying any camera:', fallbackError)
          
          // Final fallback - any camera
          stream = await navigator.mediaDevices.getUserMedia({ video: true })
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
        
        // Ensure video starts playing
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(playError => {
              console.error('Error playing video:', playError)
            })
          }
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      
      let errorMessage = 'No se pudo acceder a la cámara.'
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Permiso de cámara denegado. Por favor, permite el acceso a la cámara en la configuración del navegador.'
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No se encontró ninguna cámara en tu dispositivo.'
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Tu navegador no soporta acceso a la cámara.'
        }
      }
      
      alert(`${errorMessage} Puedes usar la opción de subir desde la galería.`)
    } finally {
      setLoading(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  const switchCamera = async () => {
    stopCamera()
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
    setTimeout(() => startCamera(), 100)
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
          const file = new File([blob], 'coffee-analysis.jpg', { type: 'image/jpeg' })
          stopCamera()
          onPhotoTaken(file)
        }
      }, 'image/jpeg', 0.9)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      onPhotoTaken(file)
    }
  }

  return (
    <div className="fixed inset-0 bg-base/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-mantle rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-surface0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text">{title}</h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-surface0 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-subtext0" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {cameraActive ? (
            <div className="space-y-4">
              <div className="relative aspect-video bg-surface0 rounded-xl overflow-hidden">
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Camera controls overlay */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-12 h-12 bg-surface1 hover:bg-surface2 text-text rounded-full flex items-center justify-center transition-colors"
                    title="Subir desde galería"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={takePhoto}
                    className="w-16 h-16 bg-peach hover:bg-peach/90 rounded-full border-4 border-base shadow-lg flex items-center justify-center transition-all active:scale-95"
                    title="Tomar foto"
                  >
                    <Camera className="w-6 h-6 text-base" />
                  </button>
                  
                  <button
                    onClick={switchCamera}
                    className="w-12 h-12 bg-surface1 hover:bg-surface2 text-text rounded-full flex items-center justify-center transition-colors"
                    title="Cambiar cámara"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>

                {/* Camera guide */}
                <div className="absolute inset-4 border-2 border-white/30 rounded-lg flex items-center justify-center pointer-events-none">
                  <div className="bg-black/50 text-white px-3 py-1 rounded-lg text-sm backdrop-blur-sm">
                    {description}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6 py-8">
              <div className="text-6xl">📸</div>
              <div>
                <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
                <p className="text-subtext1 text-sm">{description}</p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={startCamera}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-peach text-base rounded-xl hover:bg-peach/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                  Abrir Cámara
                </button>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 bg-surface1 text-text rounded-xl hover:bg-surface2 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Subir desde Galería
                </button>
              </div>

              <div className="text-xs text-subtext0 px-4">
                💡 <strong>Consejo:</strong> Asegúrate de que haya buena iluminación para mejores resultados
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}