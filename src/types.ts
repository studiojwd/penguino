export type ExportFormat = 'png' | 'jpeg' | 'webp'

export type TextAlign = 'left' | 'center' | 'right'

export type VerticalAlign = 'top' | 'center' | 'bottom'

export type TextCase = 'none' | 'uppercase' | 'lowercase' | 'titlecase'

export type FontWeightValue = 300 | 400 | 500 | 600 | 700 | 800

export type PreviewTexture = 'paper' | 'grid' | 'checker' | 'none'

export interface ColorSwatch {
  id: string
  name: string
  value: string
  favorite: boolean
  locked: boolean
}

export interface ExportPreferences {
  width: number
  autoHeight: boolean
  manualHeight: number
  format: ExportFormat
  quality: number
  scale: 1 | 2 | 3
  batchWidths: number[]
}

export interface BrandDefaults {
  fontFamily: string
  fontWeight: FontWeightValue
  textColor: string
  backgroundColor: string
  fontSizePx: number
  transparentBackground: boolean
  textAlign: TextAlign
  verticalAlign: VerticalAlign
  textCase: TextCase
  padding: number
  lineSpacing: number
  letterSpacing: number
  defaultLineCount: number
  safeGuideInset: number
  maxTextWidthPercent: number
  previewTexture: PreviewTexture
  exportPreferences: ExportPreferences
}

export interface BrandPreset {
  id: string
  name: string
  swatches: ColorSwatch[]
  defaults: BrandDefaults
}

export interface EditorState {
  activeBrandId: string
  lines: string[]
  fontFamily: string
  fontWeight: FontWeightValue
  textColor: string
  backgroundColor: string
  transparentBackground: boolean
  fontSizePx: number
  textAlign: TextAlign
  verticalAlign: VerticalAlign
  textCase: TextCase
  padding: number
  lineSpacing: number
  letterSpacing: number
  exportWidth: number
  autoHeight: boolean
  manualHeight: number
  exportFormat: ExportFormat
  exportQuality: number
  exportScale: 1 | 2 | 3
  batchWidths: number[]
  showSafeGuide: boolean
  safeGuideInset: number
  maxTextWidthPercent: number
  previewTexture: PreviewTexture
}

export interface DraftGraphic {
  id: string
  name: string
  editor: EditorState
  createdAt: string
}

export interface LayoutResult {
  width: number
  height: number
  textBlockHeight: number
  fontSize: number
  letterSpacing: number
  lines: string[]
  lineWidths: number[]
  maxLineWidth: number
  textStartY: number
  lineHeightPx: number
  textBoxWidth: number
  hasOverflow: boolean
  overflowWord: string | null
}
