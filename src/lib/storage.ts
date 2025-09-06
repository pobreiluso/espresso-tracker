import { supabase } from './supabase'

/**
 * Upload a photo to Supabase Storage
 */
export async function uploadPhoto(
  file: File,
  bucket: 'bag-photos' | 'brew-photos',
  path: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return { url: null, error: error.message }
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return { url: urlData.publicUrl, error: null }
  } catch (err) {
    console.error('Storage error:', err)
    return { 
      url: null, 
      error: err instanceof Error ? err.message : 'Unknown storage error' 
    }
  }
}

/**
 * Delete a photo from Supabase Storage
 */
export async function deletePhoto(
  bucket: 'bag-photos' | 'brew-photos',
  path: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (err) {
    console.error('Delete storage error:', err)
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown delete error' 
    }
  }
}

/**
 * Generate a unique filename for photos
 */
export function generatePhotoFilename(prefix: string, extension: string = 'jpg'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return `${prefix}-${timestamp}-${random}.${extension}`
}

/**
 * Convert File to base64 for preview
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

/**
 * Compress image before upload
 */
export function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio

      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob((blob) => {
        const compressedFile = new File([blob!], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now()
        })
        resolve(compressedFile)
      }, 'image/jpeg', quality)
    }

    img.src = URL.createObjectURL(file)
  })
}