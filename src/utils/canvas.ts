import type { RasterFormat } from './imageFiles'

export type ImageFit = 'cover' | 'contain'

export const drawImageFit = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  fit: ImageFit,
  background = '#ffffff',
) => {
  context.fillStyle = background
  context.fillRect(0, 0, width, height)
  const scale = fit === 'cover'
    ? Math.max(width / image.naturalWidth, height / image.naturalHeight)
    : Math.min(width / image.naturalWidth, height / image.naturalHeight)
  const drawWidth = image.naturalWidth * scale
  const drawHeight = image.naturalHeight * scale
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight)
}

export const canvasToBlob = (canvas: HTMLCanvasElement, format: RasterFormat, quality = 0.9) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('The image could not be generated.')),
      `image/${format}`,
      format === 'png' ? undefined : quality,
    )
  })
