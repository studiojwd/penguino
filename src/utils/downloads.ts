import { currentToolPath, trackEvent } from './analytics'

export const downloadBlobFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  trackEvent('download_completed', { tool: currentToolPath(), file_type: filename.split('.').pop()?.toLowerCase() ?? 'unknown' })
  window.setTimeout(() => URL.revokeObjectURL(url), 500)
}

export const safeFileStem = (name: string) =>
  name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'penguino'
