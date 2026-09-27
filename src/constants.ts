import type {
  BrandPreset,
  ColorSwatch,
  EditorState,
  FontWeightValue
} from './types'

export const STORAGE_KEYS = {
  brands: 'brand-text-graphic-studio/brands/v2',
  editor: 'brand-text-graphic-studio/editor/v2',
  drafts: 'brand-text-graphic-studio/drafts/v1'
} as const

export const GOOGLE_FONT_OPTIONS = [
  'Michroma',
  'Space Grotesk',
  'Manrope',
  'DM Sans',
  'Sora',
  'Lexend',
  'Bricolage Grotesque',
  'Archivo Black',
  'Fraunces',
  'Bebas Neue',
  'Montserrat'
] as const

export const FONT_WEIGHT_SUPPORT: Record<(typeof GOOGLE_FONT_OPTIONS)[number], FontWeightValue[]> = {
  Michroma: [400],
  'Space Grotesk': [300, 400, 500, 600, 700],
  Manrope: [300, 400, 500, 600, 700, 800],
  'DM Sans': [400, 500, 700],
  Sora: [300, 400, 500, 600, 700, 800],
  Lexend: [300, 400, 500, 600, 700, 800],
  'Bricolage Grotesque': [300, 400, 500, 600, 700, 800],
  'Archivo Black': [400],
  Fraunces: [300, 400, 500, 600, 700, 800],
  'Bebas Neue': [400],
  Montserrat: [300, 400, 500, 600, 700, 800]
}

export const FONT_WEIGHT_OPTIONS: Array<{ label: string; value: FontWeightValue }> = [
  { label: 'Light', value: 300 },
  { label: 'Regular', value: 400 },
  { label: 'Medium', value: 500 },
  { label: 'SemiBold', value: 600 },
  { label: 'Bold', value: 700 },
  { label: 'ExtraBold', value: 800 }
]

export const getSupportedFontWeights = (family: string): FontWeightValue[] =>
  FONT_WEIGHT_SUPPORT[family as keyof typeof FONT_WEIGHT_SUPPORT] ?? [400, 500, 700]

export const resolveFontWeight = (family: string, requestedWeight: FontWeightValue): FontWeightValue => {
  const supportedWeights = getSupportedFontWeights(family)
  if (supportedWeights.includes(requestedWeight)) {
    return requestedWeight
  }

  return supportedWeights.reduce((closest, candidate) =>
    Math.abs(candidate - requestedWeight) < Math.abs(closest - requestedWeight) ? candidate : closest,
  )
}

export const LEGACY_FONT_SIZE_PRESET_PX = {
  small: 48,
  medium: 72,
  large: 108
} as const

export const DEFAULT_FONT_SIZE_PX = 72

export const DEFAULT_EXPORT_WIDTH = 600

export const DEFAULT_MANUAL_HEIGHT = 400

export const DEFAULT_PADDING = 24

export const DEFAULT_SAFE_GUIDE_INSET_PX = 24

export const DEFAULT_MAX_TEXT_WIDTH_PERCENT = 100

export const DEFAULT_LINE_COUNT = 2

export const DEFAULT_PREVIEW_TEXTURE = 'paper' as const

export const DEFAULT_SWATCH_INPUTS = [
  ['Sky', 'rgb(67, 197, 227)'],
  ['Bubblegum', 'rgb(255, 118, 255)'],
  ['Mint', 'rgb(115, 227, 166)'],
  ['Amber', 'rgb(249, 177, 62)'],
  ['White', 'rgb(255, 255, 255)'],
  ['Deep Navy', 'rgb(18, 42, 64)']
] as const

export const EXPORT_WIDTH_PRESETS = [
  { id: 'newsletter-600', label: 'Newsletter 600', width: 600 },
  { id: 'instagram-1080', label: 'Instagram 1080', width: 1080 },
  { id: 'linkedin-1200', label: 'LinkedIn 1200', width: 1200 },
  { id: 'og-1200', label: 'OG 1200', width: 1200 }
] as const

export const DEFAULT_BATCH_WIDTHS = [600, 1080, 1200]

export const EXPORT_SCALE_OPTIONS = [1, 2, 3] as const

export const PREVIEW_TEXTURE_OPTIONS = [
  { value: 'paper', label: 'Paper' },
  { value: 'grid', label: 'Grid' },
  { value: 'checker', label: 'Checker' },
  { value: 'none', label: 'None' }
] as const

export const MAX_DRAFTS = 10

const makeSwatch = ([name, value]: readonly [string, string]): ColorSwatch => ({
  id: crypto.randomUUID(),
  name,
  value,
  favorite: false,
  locked: false
})

export const createPlaceholderLines = (count: number) => {
  const safeCount = Math.max(1, Math.round(count))
  const base = ['Headline goes here', 'Optional second line', 'Optional third line']
  return Array.from({ length: safeCount }, (_, index) => base[index] ?? '')
}

export const createDefaultBrand = (): BrandPreset => {
  const swatches = DEFAULT_SWATCH_INPUTS.map(makeSwatch)
  return {
    id: crypto.randomUUID(),
    name: 'Example Brand',
    swatches,
    defaults: {
      fontFamily: 'Michroma',
      fontWeight: 400,
      textColor: swatches[5].value,
      backgroundColor: swatches[4].value,
      fontSizePx: DEFAULT_FONT_SIZE_PX,
      transparentBackground: false,
      textAlign: 'center',
      verticalAlign: 'center',
      textCase: 'none',
      padding: DEFAULT_PADDING,
      lineSpacing: 1.08,
      letterSpacing: 1.4,
      defaultLineCount: DEFAULT_LINE_COUNT,
      safeGuideInset: DEFAULT_SAFE_GUIDE_INSET_PX,
      maxTextWidthPercent: DEFAULT_MAX_TEXT_WIDTH_PERCENT,
      previewTexture: DEFAULT_PREVIEW_TEXTURE,
      exportPreferences: {
        width: DEFAULT_EXPORT_WIDTH,
        autoHeight: true,
        manualHeight: DEFAULT_MANUAL_HEIGHT,
        format: 'png',
        quality: 0.9,
        scale: 2,
        batchWidths: DEFAULT_BATCH_WIDTHS
      }
    }
  }
}

export const createDefaultEditorState = (brand: BrandPreset): EditorState => ({
  activeBrandId: brand.id,
  lines: createPlaceholderLines(brand.defaults.defaultLineCount),
  fontFamily: brand.defaults.fontFamily,
  fontWeight: brand.defaults.fontWeight,
  textColor: brand.defaults.textColor,
  backgroundColor: brand.defaults.backgroundColor,
  transparentBackground: brand.defaults.transparentBackground,
  fontSizePx: brand.defaults.fontSizePx,
  textAlign: brand.defaults.textAlign,
  verticalAlign: brand.defaults.verticalAlign,
  textCase: brand.defaults.textCase,
  padding: brand.defaults.padding,
  lineSpacing: brand.defaults.lineSpacing,
  letterSpacing: brand.defaults.letterSpacing,
  exportWidth: brand.defaults.exportPreferences.width,
  autoHeight: true,
  manualHeight: brand.defaults.exportPreferences.manualHeight,
  exportFormat: brand.defaults.exportPreferences.format,
  exportQuality: brand.defaults.exportPreferences.quality,
  exportScale: brand.defaults.exportPreferences.scale,
  batchWidths: brand.defaults.exportPreferences.batchWidths,
  showSafeGuide: true,
  safeGuideInset: DEFAULT_SAFE_GUIDE_INSET_PX,
  maxTextWidthPercent: brand.defaults.maxTextWidthPercent,
  previewTexture: brand.defaults.previewTexture
})
