export type AnalyticsValue = string | number | boolean
export type AnalyticsParameters = Record<string, AnalyticsValue | undefined>

export interface DownloadAnalytics extends AnalyticsParameters {
  input_size_bytes?: number
  file_count?: number
}

export interface LocalUsageStats {
  version: 1
  filesSelected: number
  filesProcessed: number
  downloads: number
  inputBytes: number
  outputBytes: number
  bytesSaved: number
  toolDownloads: Record<string, number>
  formats: Record<string, number>
  updatedAt: string | null
}

const STATS_KEY = 'penguino/usage-stats/v1'
const STATS_EVENT = 'penguino-stats-updated'

const emptyStats = (): LocalUsageStats => ({
  version: 1,
  filesSelected: 0,
  filesProcessed: 0,
  downloads: 0,
  inputBytes: 0,
  outputBytes: 0,
  bytesSaved: 0,
  toolDownloads: {},
  formats: {},
  updatedAt: null,
})

export const trackEvent = (name: string, parameters: AnalyticsParameters = {}) => {
  window.gtag?.('event', name, parameters)
}

export const currentToolPath = () => window.location.pathname.replace(/^\//, '') || 'home'

export const getLocalUsageStats = (): LocalUsageStats => {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STATS_KEY) ?? 'null') as Partial<LocalUsageStats> | null
    return stored?.version === 1 ? { ...emptyStats(), ...stored } : emptyStats()
  } catch {
    return emptyStats()
  }
}

export const clearLocalUsageStats = () => {
  window.localStorage.removeItem(STATS_KEY)
  window.dispatchEvent(new Event(STATS_EVENT))
}

export const subscribeToLocalUsageStats = (listener: () => void) => {
  window.addEventListener(STATS_EVENT, listener)
  return () => window.removeEventListener(STATS_EVENT, listener)
}

const updateLocalStats = (update: (stats: LocalUsageStats) => LocalUsageStats) => {
  const next = update(getLocalUsageStats())
  next.updatedAt = new Date().toISOString()
  window.localStorage.setItem(STATS_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(STATS_EVENT))
}

const extensionFromName = (name: string) => name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'unknown'

const imageDimensions = async (blob: Blob): Promise<{ width: number; height: number } | null> => {
  if (!blob.type.startsWith('image/') || blob.type === 'image/svg+xml') return null
  try {
    if ('createImageBitmap' in window) {
      const bitmap = await createImageBitmap(blob)
      const dimensions = { width: bitmap.width, height: bitmap.height }
      bitmap.close()
      return dimensions
    }
    const url = URL.createObjectURL(blob)
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const element = new Image()
        element.onload = () => resolve(element)
        element.onerror = () => reject(new Error('Image dimensions unavailable.'))
        element.src = url
      })
      return { width: image.naturalWidth, height: image.naturalHeight }
    } finally {
      URL.revokeObjectURL(url)
    }
  } catch {
    return null
  }
}

export const trackFileSelected = async (file: File, parameters: AnalyticsParameters = {}) => {
  const tool = String(parameters.tool ?? currentToolPath())
  const base = {
    ...parameters,
    tool,
    file_type: file.type || 'unknown',
    file_extension: extensionFromName(file.name),
    input_size_bytes: file.size,
    file_count: 1,
  }
  updateLocalStats((stats) => ({ ...stats, filesSelected: stats.filesSelected + 1, inputBytes: stats.inputBytes + file.size }))
  const dimensions = await imageDimensions(file)
  trackEvent('file_selected', {
    ...base,
    ...(dimensions ? { input_width: dimensions.width, input_height: dimensions.height } : {}),
  })
}

export const trackFilesSelected = (files: File[], parameters: AnalyticsParameters = {}) => {
  if (!files.length) return
  if (files.length === 1) {
    void trackFileSelected(files[0], parameters)
    return
  }
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
  const formats = [...new Set(files.map((file) => extensionFromName(file.name)))].join('|')
  updateLocalStats((stats) => ({ ...stats, filesSelected: stats.filesSelected + files.length, inputBytes: stats.inputBytes + totalBytes }))
  trackEvent('file_selected', {
    ...parameters,
    tool: parameters.tool ?? currentToolPath(),
    file_type: 'multiple',
    file_formats: formats,
    input_size_bytes: totalBytes,
    file_count: files.length,
  })
}

export const trackDownload = async (blob: Blob, format: string, parameters: DownloadAnalytics = {}) => {
  const tool = String(parameters.tool ?? currentToolPath())
  const fileCount = Number(parameters.file_count ?? 1)
  const inputBytes = Number(parameters.input_size_bytes ?? 0)
  updateLocalStats((stats) => ({
    ...stats,
    filesProcessed: stats.filesProcessed + fileCount,
    downloads: stats.downloads + 1,
    outputBytes: stats.outputBytes + blob.size,
    bytesSaved: stats.bytesSaved + Math.max(0, inputBytes - blob.size),
    toolDownloads: { ...stats.toolDownloads, [tool]: (stats.toolDownloads[tool] ?? 0) + 1 },
    formats: { ...stats.formats, [format]: (stats.formats[format] ?? 0) + 1 },
  }))

  const dimensions = await imageDimensions(blob)
  const eventParameters = {
    ...parameters,
    tool,
    file_type: format,
    output_format: format,
    output_size_bytes: blob.size,
    file_count: fileCount,
    ...(dimensions ? { output_width: dimensions.width, output_height: dimensions.height } : {}),
  }
  trackEvent('processing_completed', eventParameters)
  trackEvent('download_completed', eventParameters)
}

export const trackProcessingFailed = (tool: string, operation: string, error: unknown) => {
  trackEvent('processing_failed', {
    tool,
    operation,
    error_type: error instanceof DOMException ? error.name : error instanceof Error ? error.constructor.name : 'unknown',
  })
}

export const qualityBucket = (quality: number) => quality < 0.6 ? 'low' : quality < 0.85 ? 'medium' : 'high'

export const formatLocalBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}
