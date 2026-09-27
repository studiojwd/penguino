import {
  DEFAULT_BATCH_WIDTHS,
  DEFAULT_FONT_SIZE_PX,
  DEFAULT_EXPORT_WIDTH,
  DEFAULT_PADDING,
  DEFAULT_SAFE_GUIDE_INSET_PX,
  LEGACY_FONT_SIZE_PRESET_PX,
  MAX_DRAFTS,
  STORAGE_KEYS,
  createDefaultBrand,
  createDefaultEditorState,
  resolveFontWeight
} from '../constants'
import type { BrandPreset, DraftGraphic, EditorState, PreviewTexture } from '../types'

interface StoredState {
  brands: BrandPreset[]
  editor: EditorState
  drafts: DraftGraphic[]
}

type LegacyFontSizePreset = keyof typeof LEGACY_FONT_SIZE_PRESET_PX

const normalizeFontSizePx = (fontSizePx: unknown, fontSizePreset: unknown) => {
  if (typeof fontSizePx === 'number' && Number.isFinite(fontSizePx) && fontSizePx > 0) {
    return fontSizePx
  }

  if (typeof fontSizePreset === 'string' && fontSizePreset in LEGACY_FONT_SIZE_PRESET_PX) {
    return LEGACY_FONT_SIZE_PRESET_PX[fontSizePreset as LegacyFontSizePreset]
  }

  return DEFAULT_FONT_SIZE_PX
}

const normalizeBrand = (brand: BrandPreset, fallback: BrandPreset): BrandPreset => {
  const migratedFromOlderVersion = !('textCase' in brand.defaults)
  const missingFontWeight = !('fontWeight' in brand.defaults)
  const legacyDefaults = brand.defaults as Partial<BrandPreset['defaults']> & {
    fontSizePreset?: LegacyFontSizePreset
  }
  const previewTexture = (legacyDefaults.previewTexture ?? fallback.defaults.previewTexture) as PreviewTexture

  return {
    ...brand,
    name: brand.name === 'StudioJWD' ? 'Example Brand' : brand.name,
    defaults: {
      ...brand.defaults,
      fontWeight: missingFontWeight
        ? fallback.defaults.fontWeight
        : resolveFontWeight(brand.defaults.fontFamily, brand.defaults.fontWeight),
      fontSizePx: normalizeFontSizePx(legacyDefaults.fontSizePx, legacyDefaults.fontSizePreset),
      textCase: migratedFromOlderVersion ? 'none' : brand.defaults.textCase,
      padding:
        migratedFromOlderVersion && brand.defaults.padding === 56
          ? DEFAULT_PADDING
          : brand.defaults.padding,
      defaultLineCount:
        typeof legacyDefaults.defaultLineCount === 'number'
          ? legacyDefaults.defaultLineCount
          : fallback.defaults.defaultLineCount,
      safeGuideInset:
        typeof legacyDefaults.safeGuideInset === 'number'
          ? legacyDefaults.safeGuideInset
          : fallback.defaults.safeGuideInset,
      maxTextWidthPercent:
        typeof legacyDefaults.maxTextWidthPercent === 'number'
          ? legacyDefaults.maxTextWidthPercent
          : fallback.defaults.maxTextWidthPercent,
      previewTexture,
      exportPreferences: {
        ...brand.defaults.exportPreferences,
        width:
          migratedFromOlderVersion && brand.defaults.exportPreferences.width === 720
            ? DEFAULT_EXPORT_WIDTH
            : brand.defaults.exportPreferences.width,
        scale:
          typeof brand.defaults.exportPreferences.scale === 'number'
            ? brand.defaults.exportPreferences.scale
            : fallback.defaults.exportPreferences.scale,
        batchWidths:
          Array.isArray(brand.defaults.exportPreferences.batchWidths) &&
          brand.defaults.exportPreferences.batchWidths.length > 0
            ? brand.defaults.exportPreferences.batchWidths
            : DEFAULT_BATCH_WIDTHS
      }
    },
    swatches:
      Array.isArray(brand.swatches) && brand.swatches.length > 0
        ? brand.swatches.map((swatch) => ({
            ...swatch,
            favorite: swatch.favorite ?? false,
            locked: swatch.locked ?? false
          }))
        : fallback.swatches
  }
}

const normalizeEditor = (editor: EditorState, brand: BrandPreset): EditorState => {
  const legacyEditor = editor as Partial<EditorState>
  const migratedFromOlderVersion = !('textCase' in legacyEditor)
  const missingFontWeight = !('fontWeight' in legacyEditor)
  const legacySizeEditor = legacyEditor as Partial<EditorState> & {
    fontSizePreset?: LegacyFontSizePreset
  }
  const normalizedLines =
    Array.isArray(legacyEditor.lines) && legacyEditor.lines.length > 0
      ? legacyEditor.lines.filter((line): line is string => typeof line === 'string')
      : ['']

  return {
    ...editor,
    activeBrandId: brand.id,
    lines: normalizedLines.length > 0 ? normalizedLines : [''],
    fontWeight: missingFontWeight
      ? brand.defaults.fontWeight
      : resolveFontWeight(editor.fontFamily, editor.fontWeight),
    fontSizePx: normalizeFontSizePx(legacySizeEditor.fontSizePx, legacySizeEditor.fontSizePreset),
    textCase: migratedFromOlderVersion ? 'none' : editor.textCase,
    padding:
      migratedFromOlderVersion && legacyEditor.padding === 56 ? DEFAULT_PADDING : editor.padding,
    autoHeight: true,
    exportWidth:
      migratedFromOlderVersion && legacyEditor.exportWidth === 720
        ? DEFAULT_EXPORT_WIDTH
        : editor.exportWidth,
    exportScale:
      typeof legacyEditor.exportScale === 'number'
        ? (legacyEditor.exportScale as EditorState['exportScale'])
        : brand.defaults.exportPreferences.scale,
    batchWidths:
      Array.isArray(legacyEditor.batchWidths) && legacyEditor.batchWidths.length > 0
        ? legacyEditor.batchWidths.filter((width): width is number => typeof width === 'number')
        : brand.defaults.exportPreferences.batchWidths,
    safeGuideInset: DEFAULT_SAFE_GUIDE_INSET_PX,
    maxTextWidthPercent:
      typeof legacyEditor.maxTextWidthPercent === 'number'
        ? legacyEditor.maxTextWidthPercent
        : brand.defaults.maxTextWidthPercent,
    previewTexture:
      (legacyEditor.previewTexture as PreviewTexture | undefined) ?? brand.defaults.previewTexture
  }
}

const normalizeDraft = (draft: DraftGraphic, brand: BrandPreset): DraftGraphic => ({
  ...draft,
  editor: normalizeEditor(draft.editor, brand)
})

export const loadStoredState = (): StoredState => {
  const fallbackBrand = createDefaultBrand()
  const fallbackEditor = createDefaultEditorState(fallbackBrand)

  try {
    const rawBrands = window.localStorage.getItem(STORAGE_KEYS.brands)
    const rawEditor = window.localStorage.getItem(STORAGE_KEYS.editor)
    const rawDrafts = window.localStorage.getItem(STORAGE_KEYS.drafts)
    const parsedBrands = rawBrands ? (JSON.parse(rawBrands) as BrandPreset[]) : [fallbackBrand]
    const brands =
      parsedBrands.length > 0 ? parsedBrands.map((brand) => normalizeBrand(brand, fallbackBrand)) : [fallbackBrand]
    const parsedEditor = rawEditor
      ? (JSON.parse(rawEditor) as EditorState)
      : createDefaultEditorState(brands[0])
    const activeBrand =
      brands.find((brand) => brand.id === parsedEditor.activeBrandId) ?? brands[0]
    const normalizedEditor = normalizeEditor(parsedEditor, activeBrand)
    const parsedDrafts = rawDrafts ? (JSON.parse(rawDrafts) as DraftGraphic[]) : []
    const drafts = parsedDrafts
      .map((draft) => {
        const draftBrand = brands.find((brand) => brand.id === draft.editor.activeBrandId) ?? activeBrand
        return normalizeDraft(draft, draftBrand)
      })
      .slice(0, MAX_DRAFTS)

    return {
      brands,
      editor: {
        ...normalizedEditor,
        activeBrandId: activeBrand.id
      },
      drafts
    }
  } catch {
    return {
      brands: [fallbackBrand],
      editor: fallbackEditor,
      drafts: []
    }
  }
}

export const saveBrands = (brands: BrandPreset[]) => {
  window.localStorage.setItem(STORAGE_KEYS.brands, JSON.stringify(brands))
}

export const saveEditor = (editor: EditorState) => {
  window.localStorage.setItem(STORAGE_KEYS.editor, JSON.stringify(editor))
}

export const saveDrafts = (drafts: DraftGraphic[]) => {
  window.localStorage.setItem(STORAGE_KEYS.drafts, JSON.stringify(drafts.slice(0, MAX_DRAFTS)))
}
