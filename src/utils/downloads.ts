import { trackDownload, type DownloadAnalytics } from './analytics'

export const downloadBlobFile = (blob: Blob, filename: string, analytics: DownloadAnalytics = {}) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  void trackDownload(blob, filename.split('.').pop()?.toLowerCase() ?? 'unknown', analytics)
  window.setTimeout(() => URL.revokeObjectURL(url), 500)
}

export const safeFileStem = (name: string) =>
  name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'penguino'
