import { resolveFontWeight } from '../constants'
import { lineStartX } from './layout'
import type { EditorState, ExportFormat, LayoutResult } from '../types'

const MIME_TYPES: Record<ExportFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp'
}

const drawBackground = (
  context: CanvasRenderingContext2D,
  state: EditorState,
  layout: LayoutResult,
  format: ExportFormat,
) => {
  const shouldRenderTransparent = state.transparentBackground && format !== 'jpeg'
  if (shouldRenderTransparent) {
    context.clearRect(0, 0, layout.width, layout.height)
    return
  }

  context.fillStyle = state.backgroundColor
  context.fillRect(0, 0, layout.width, layout.height)
}

const drawTextWithSpacing = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  letterSpacing: number,
) => {
  if (letterSpacing === 0) {
    context.fillText(text, x, y)
    return
  }

  let cursor = x
  for (const character of text) {
    context.fillText(character, cursor, y)
    cursor += context.measureText(character).width + letterSpacing
  }
}

const drawSafeGuide = (
  context: CanvasRenderingContext2D,
  layout: LayoutResult,
  inset: number,
) => {
  const insetX = Math.min(inset, Math.max(0, (layout.width - 2) / 2))
  const insetY = Math.min(inset, Math.max(0, (layout.height - 2) / 2))

  context.save()
  context.strokeStyle = 'rgba(18, 42, 64, 0.28)'
  context.setLineDash([12, 8])
  context.lineWidth = 2
  context.strokeRect(insetX, insetY, layout.width - insetX * 2, layout.height - insetY * 2)
  context.restore()
}

const renderToCanvas = (
  state: EditorState,
  layout: LayoutResult,
  options?: { includeGuide?: boolean; format?: ExportFormat },
) => {
  const canvas = document.createElement('canvas')
  const scale = state.exportScale
  canvas.width = layout.width * scale
  canvas.height = layout.height * scale
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas export is not supported in this browser.')
  }

  context.scale(scale, scale)
  drawBackground(context, state, layout, options?.format ?? state.exportFormat)

  context.textBaseline = 'top'
  context.font = `${resolveFontWeight(state.fontFamily, state.fontWeight)} ${layout.fontSize}px "${state.fontFamily}", sans-serif`
  context.fillStyle = state.textColor
  context.imageSmoothingEnabled = true

  layout.lines.forEach((line, index) => {
    const x = lineStartX(layout.width, state.padding, layout.lineWidths[index], state.textAlign)
    const y = layout.textStartY + index * layout.lineHeightPx
    drawTextWithSpacing(context, line, x, y, layout.letterSpacing)
  })

  if (options?.includeGuide) {
    drawSafeGuide(context, layout, state.safeGuideInset)
  }

  return canvas
}

export const buildPreviewDataUrl = (state: EditorState, layout: LayoutResult) =>
  renderToCanvas(state, layout, {
    includeGuide: state.showSafeGuide,
    format: state.exportFormat
  }).toDataURL('image/png')

export const exportGraphic = async (
  state: EditorState,
  layout: LayoutResult,
  format: ExportFormat,
  quality: number,
) => {
  const canvas = renderToCanvas(state, layout, { format })
  const mimeType = MIME_TYPES[format]

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => {
        if (value) {
          resolve(value)
          return
        }
        reject(new Error('The browser could not generate the export blob.'))
      },
      mimeType,
      format === 'png' ? undefined : quality,
    )
  })

  return { blob, mimeType }
}

export const canCopyImagesToClipboard = () =>
  typeof window !== 'undefined' &&
  'ClipboardItem' in window &&
  !!navigator.clipboard?.write

export const copyBlobToClipboard = async (blob: Blob) => {
  await navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob
    })
  ])
}

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
