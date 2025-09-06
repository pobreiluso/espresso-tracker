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
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported')
      }

      // Mobile-optimized constraints
      const constraints = {
        video: { 
          facingMode: 'environment', // Prefer back camera for mobile
          width: { ideal: 1280, min: 640, max: 1920 },
          height: { ideal: 720, min: 480, max: 1080 }
        },
        audio: false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Mobile-specific video setup
        videoRef.current.setAttribute('playsinline', 'true')
        videoRef.current.setAttribute('webkit-playsinline', 'true')
        videoRef.current.muted = true
        
        // Wait for video to be ready before setting camera active
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current) {
                videoRef.current.play().then(() => {
                  setCameraActive(true)
                  resolve(true)
                }).catch(playError => {
                  console.error('Error playing video:', playError)
                  resolve(true)
                })
              }
            }
          }
        })
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
          <div className="flex-1 relative bg-black">
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ 
                transform: 'scaleX(-1)', // Mirror for better user experience
                minHeight: '60vh' // Ensure minimum height on mobile
              }}
            />
            
            {/* Mobile-optimized camera controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-6">
              <div className="flex items-center justify-center space-x-8">
                {/* Gallery access button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30 active:scale-95 transition-transform"
                >
                  <Upload className="w-8 h-8" />
                </button>
                
                {/* Capture button */}
                <button
                  onClick={takePhoto}
                  className="w-20 h-20 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
                >
                  <div className="w-16 h-16 bg-red-500 rounded-full" />
                </button>
                
                {/* Switch camera button */}
                <button
                  onClick={stopCamera}
                  className="w-16 h-16 bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30 active:scale-95 transition-transform"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>
              
              <p className="text-white text-center mt-4 text-sm opacity-80">
                Centra la etiqueta del café y toca el botón rojo
              </p>
            </div>

            {/* Camera overlay guide */}
            <div className="absolute top-20 left-4 right-4 bottom-32">
              <div className="w-full h-full border-2 border-white/50 rounded-lg relative">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black/70 text-white px-3 py-1 rounded text-xs backdrop-blur-sm">
                    Etiqueta del café
                  </div>
                </div>
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
            
            <div className="space-y-4 w-full max-w-sm">
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
                📷 Tomar Foto
              </button>
              
              <div className="relative">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary w-full flex items-center justify-center gap-3 h-14 text-base font-medium"
                >
                  <Upload className="w-5 h-5" />
                  📱 Elegir desde Galería
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              
              <p className="text-xs text-subtext0 text-center">
                O puedes saltarte la foto y agregar el café manualmente
              </p>
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