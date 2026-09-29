import { currentToolPath, trackEvent } from './analytics'

export type RasterFormat = 'png' | 'jpeg' | 'webp'

export const loadImageFile = (file: File) =>
  new Promise<{ image: HTMLImageElement; url: string }>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => resolve({ image, url })
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('That image could not be opened.'))
    }
    image.src = url
  })

export const imageToBlob = async (
  image: HTMLImageElement,
  width: number,
  height: number,
  format: RasterFormat,
  quality: number,
) => {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Image processing is unavailable in this browser.')

  if (format === 'jpeg') {
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
  }
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  const mimeType = `image/${format}`
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('The image could not be generated.')),
      mimeType,
      format === 'png' ? undefined : quality,
    )
  })
}

export const downloadImageBlob = (blob: Blob, sourceName: string, suffix: string, format: RasterFormat, prefix = '') => {
  const stem = sourceName.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'penguino_image'
  const cleanPrefix = prefix.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '')
  const extension = format === 'jpeg' ? 'jpg' : format
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${cleanPrefix ? `${cleanPrefix}_` : ''}${stem}_${suffix}.${extension}`
  link.click()
  trackEvent('download_completed', { tool: currentToolPath(), file_type: extension })
  window.setTimeout(() => URL.revokeObjectURL(url), 500)
}

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
