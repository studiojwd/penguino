import { useEffect, useMemo, useState } from 'react'
import BrandManager from '../components/BrandManager'
import ColorControls from '../components/ColorControls'
import ExportControls from '../components/ExportControls'
import PreviewStage from '../components/PreviewStage'
import SizeControls from '../components/SizeControls'
import TextControls from '../components/TextControls'
import {
  createDefaultBrand,
  createDefaultEditorState,
  createPlaceholderLines,
  resolveFontWeight
} from '../constants'
import type { BrandPreset, ColorSwatch, EditorState, ExportFormat, LayoutResult } from '../types'
import {
  buildPreviewDataUrl,
  canCopyImagesToClipboard,
  copyBlobToClipboard,
  exportGraphic,
  formatFileSize
} from '../utils/exporters'
import { buildFilename } from '../utils/filenames'
import { ensureGoogleFontLoaded } from '../utils/googleFonts'
import { computeLayout } from '../utils/layout'
import { loadStoredState, saveBrands, saveEditor } from '../utils/storage'
import { qualityBucket, trackDownload, trackEvent, trackProcessingFailed } from '../utils/analytics'

type PanelKey = 'brand' | 'text' | 'colours' | 'canvas' | 'download'
type EditorUpdater = EditorState | ((current: EditorState) => EditorState)

const EMPTY_PREVIEW =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='

const HISTORY_LIMIT = 50

const cloneBrand = (brand: BrandPreset, name: string): BrandPreset => ({
  ...brand,
  id: crypto.randomUUID(),
  name,
  swatches: brand.swatches.map((swatch) => ({
    ...swatch,
    id: crypto.randomUUID()
  })),
  defaults: {
    ...brand.defaults,
    exportPreferences: {
      ...brand.defaults.exportPreferences,
      batchWidths: [...brand.defaults.exportPreferences.batchWidths]
    }
  }
})

const createBlankSwatch = (index: number): ColorSwatch => ({
  id: crypto.randomUUID(),
  name: `Colour ${index}`,
  value: '#000000',
  favorite: false,
  locked: false
})

const makeUniqueName = (baseName: string, brands: BrandPreset[]) => {
  const existing = new Set(brands.map((brand) => brand.name.toLowerCase()))
  if (!existing.has(baseName.toLowerCase())) {
    return baseName
  }

  let index = 2
  let candidate = `${baseName} ${index}`
  while (existing.has(candidate.toLowerCase())) {
    index += 1
    candidate = `${baseName} ${index}`
  }
  return candidate
}

const editorFromBrandDefaults = (brand: BrandPreset, lines: string[]): EditorState => ({
  ...createDefaultEditorState(brand),
  activeBrandId: brand.id,
  lines: lines.length > 0 ? lines : createPlaceholderLines(brand.defaults.defaultLineCount)
})

const defaultsFromEditor = (editor: EditorState): BrandPreset['defaults'] => ({
  fontFamily: editor.fontFamily,
  fontWeight: editor.fontWeight,
  textColor: editor.textColor,
  backgroundColor: editor.backgroundColor,
  fontSizePx: editor.fontSizePx,
  transparentBackground: editor.transparentBackground,
  textAlign: editor.textAlign,
  verticalAlign: editor.verticalAlign,
  textCase: editor.textCase,
  padding: editor.padding,
  lineSpacing: editor.lineSpacing,
  letterSpacing: editor.letterSpacing,
  defaultLineCount: Math.max(1, editor.lines.length),
  safeGuideInset: editor.safeGuideInset,
  maxTextWidthPercent: editor.maxTextWidthPercent,
  previewTexture: editor.previewTexture,
  exportPreferences: {
    width: editor.exportWidth,
    autoHeight: editor.autoHeight,
    manualHeight: editor.manualHeight,
    format: editor.exportFormat,
    quality: editor.exportQuality,
    scale: editor.exportScale,
    batchWidths: [...editor.batchWidths]
  }
})

const downloadBlob = (blob: Blob, filename: string, format: ExportFormat, width: number, height: number, quality: number, transparent: boolean) => {
  const extension = format === 'jpeg' ? 'jpg' : format
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.${extension}`
  document.body.appendChild(link)
  link.click()
  void trackDownload(blob, extension, { tool: 'text-graphic', operation: 'create_text_graphic', output_width: width, output_height: height, transparent_background: transparent, quality_band: qualityBucket(quality) })
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 500)
}

const downloadJson = (data: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  trackEvent('settings_exported', { tool: 'text-graphic', file_type: 'json' })
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 500)
}

const pickRandomSwatch = (swatches: ColorSwatch[], excludeValue?: string) => {
  const filtered = swatches.filter((swatch) => swatch.value !== excludeValue)
  const pool = filtered.length > 0 ? filtered : swatches
  return pool[Math.floor(Math.random() * pool.length)]
}

const TextGraphicTool = () => {
  const [storedState] = useState(() => loadStoredState())
  const [brands, setBrands] = useState<BrandPreset[]>(storedState.brands)
  const [editor, setEditor] = useState<EditorState>(storedState.editor)
  const [past, setPast] = useState<EditorState[]>([])
  const [future, setFuture] = useState<EditorState[]>([])
  const [layout, setLayout] = useState<LayoutResult>(() => computeLayout(storedState.editor))
  const [previewUrl, setPreviewUrl] = useState(EMPTY_PREVIEW)
  const [estimatedSize, setEstimatedSize] = useState('Calculating...')
  const [statusMessage, setStatusMessage] = useState('Ready when you are.')
  const [collapsedPanels, setCollapsedPanels] = useState<Record<PanelKey, boolean>>({
    brand: false,
    text: false,
    colours: true,
    canvas: true,
    download: false
  })

  const activeBrand = useMemo(
    () => brands.find((brand) => brand.id === editor.activeBrandId) ?? brands[0],
    [brands, editor.activeBrandId],
  )
  const filename = useMemo(
    () => buildFilename(activeBrand.name, editor, layout),
    [activeBrand.name, editor, layout],
  )
  const clipboardSupported = useMemo(() => canCopyImagesToClipboard(), [])

  useEffect(() => {
    saveBrands(brands)
  }, [brands])

  useEffect(() => {
    saveEditor(editor)
  }, [editor])

  useEffect(() => {
    let cancelled = false

    setStatusMessage('Rendering preview...')
    ensureGoogleFontLoaded(editor.fontFamily)
      .then(() => {
        if (cancelled) {
          return
        }
        const nextLayout = computeLayout(editor)
        setLayout(nextLayout)
        setPreviewUrl(buildPreviewDataUrl(editor, nextLayout))
        setStatusMessage('Preview is up to date.')
      })
      .catch(() => {
        if (!cancelled) {
          setStatusMessage('Preview rendered with fallback font.')
          const nextLayout = computeLayout(editor)
          setLayout(nextLayout)
          setPreviewUrl(buildPreviewDataUrl(editor, nextLayout))
        }
      })

    return () => {
      cancelled = true
    }
  }, [editor])

  useEffect(() => {
    let cancelled = false
    const timeout = window.setTimeout(async () => {
      try {
        await ensureGoogleFontLoaded(editor.fontFamily)
        const exportLayout = computeLayout(editor)
        const { blob } = await exportGraphic(
          editor,
          exportLayout,
          editor.exportFormat,
          editor.exportQuality,
        )
        if (!cancelled) {
          setEstimatedSize(formatFileSize(blob.size))
        }
      } catch {
        if (!cancelled) {
          setEstimatedSize('Unavailable')
        }
      }
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [editor])

  const commitEditor = (updater: EditorUpdater, shouldRecordHistory = true) => {
    setEditor((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater
      if (JSON.stringify(current) === JSON.stringify(next)) {
        return current
      }

      if (shouldRecordHistory) {
        setPast((currentPast) => [...currentPast.slice(-(HISTORY_LIMIT - 1)), current])
        setFuture([])
      }

      return next
    })
  }

  const updateActiveBrand = (updater: (brand: BrandPreset) => BrandPreset) => {
    setBrands((currentBrands) =>
      currentBrands.map((brand) => (brand.id === activeBrand.id ? updater(brand) : brand)),
    )
  }

  const handleFieldChange = <K extends keyof EditorState>(field: K, value: EditorState[K]) => {
    commitEditor((current) => {
      const next = { ...current, [field]: value } as EditorState
      if (field === 'fontFamily') {
        next.fontWeight = resolveFontWeight(String(value), current.fontWeight)
      }
      if (field === 'exportWidth') {
        next.exportWidth = Math.max(1, Number(value) || current.exportWidth)
      }
      return next
    })
  }

  const handleSwitchBrand = (brandId: string) => {
    const nextBrand = brands.find((brand) => brand.id === brandId)
    if (!nextBrand) {
      return
    }
    commitEditor((current) => editorFromBrandDefaults(nextBrand, current.lines))
  }

  const handleCreateBrand = () => {
    const nextBrand = {
      ...createDefaultBrand(),
      name: makeUniqueName('New Brand', brands)
    }
    setBrands((currentBrands) => [...currentBrands, nextBrand])
    commitEditor((current) => editorFromBrandDefaults(nextBrand, current.lines))
  }

  const handleDuplicateBrand = () => {
    const nextBrand = cloneBrand(activeBrand, makeUniqueName(`${activeBrand.name} Copy`, brands))
    setBrands((currentBrands) => [...currentBrands, nextBrand])
    commitEditor((current) => editorFromBrandDefaults(nextBrand, current.lines))
  }

  const handleDeleteBrand = () => {
    if (brands.length === 1) {
      return
    }
    if (!window.confirm(`Delete ${activeBrand.name}? This only removes the local preset.`)) {
      return
    }

    const remainingBrands = brands.filter((brand) => brand.id !== activeBrand.id)
    const nextBrand = remainingBrands[0]
    setBrands(remainingBrands)
    commitEditor((current) => editorFromBrandDefaults(nextBrand, current.lines))
  }

  const handleRenameBrand = (name: string) => {
    updateActiveBrand((brand) => ({ ...brand, name }))
  }

  const handleBrandFontChange = (fontFamily: string) => {
    const fontWeight = resolveFontWeight(fontFamily, activeBrand.defaults.fontWeight)
    updateActiveBrand((brand) => ({
      ...brand,
      defaults: {
        ...brand.defaults,
        fontFamily,
        fontWeight
      }
    }))
    commitEditor((current) => ({
      ...current,
      fontFamily,
      fontWeight: resolveFontWeight(fontFamily, current.fontWeight)
    }))
  }

  const handleSaveCurrentAsDefaults = () => {
    updateActiveBrand((brand) => ({
      ...brand,
      defaults: defaultsFromEditor(editor)
    }))
    setStatusMessage(`${activeBrand.name} defaults saved.`)
  }

  const handleApplyBrandDefaults = () => {
    commitEditor((current) => editorFromBrandDefaults(activeBrand, current.lines))
  }

  const handleSwatchRename = (swatchId: string, name: string) => {
    updateActiveBrand((brand) => ({
      ...brand,
      swatches: brand.swatches.map((swatch) =>
        swatch.id === swatchId ? { ...swatch, name } : swatch,
      )
    }))
  }

  const handleSwatchValueChange = (swatchId: string, value: string) => {
    updateActiveBrand((brand) => ({
      ...brand,
      swatches: brand.swatches.map((swatch) =>
        swatch.id === swatchId ? { ...swatch, value } : swatch,
      )
    }))
  }

  const handleAddSwatch = () => {
    updateActiveBrand((brand) => ({
      ...brand,
      swatches: [...brand.swatches, createBlankSwatch(brand.swatches.length + 1)]
    }))
  }

  const handleRemoveSwatch = (swatchId: string) => {
    updateActiveBrand((brand) => {
      if (brand.swatches.length === 1) {
        return brand
      }
      return {
        ...brand,
        swatches: brand.swatches.filter((swatch) => swatch.id !== swatchId)
      }
    })
  }

  const handleExportBrands = () => {
    downloadJson(brands, 'brand-text-graphic-studio-brands.json')
  }

  const handleImportBrands = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as BrandPreset[]
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Expected an array of brand presets.')
      }

      setBrands(parsed)
      commitEditor((current) => editorFromBrandDefaults(parsed[0], current.lines))
      setStatusMessage(`Imported ${parsed.length} brand preset${parsed.length === 1 ? '' : 's'}.`)
    } catch {
      window.alert('That JSON file was not recognised as a brand preset export.')
    }
  }

  const handleLineChange = (index: number, value: string) => {
    commitEditor((current) => ({
      ...current,
      lines: current.lines.map((line, lineIndex) => (lineIndex === index ? value : line))
    }))
  }

  const handleAddLine = () => {
    commitEditor((current) => ({
      ...current,
      lines: [...current.lines, '']
    }))
  }

  const handleRemoveLine = (index: number) => {
    commitEditor((current) => ({
      ...current,
      lines:
        current.lines.length === 1
          ? current.lines
          : current.lines.filter((_, lineIndex) => lineIndex !== index)
    }))
  }

  const handleUndo = () => {
    setPast((currentPast) => {
      const previous = currentPast[currentPast.length - 1]
      if (!previous) {
        return currentPast
      }

      setEditor((current) => {
        setFuture((currentFuture) => [current, ...currentFuture].slice(0, HISTORY_LIMIT))
        return previous
      })
      return currentPast.slice(0, -1)
    })
  }

  const handleRedo = () => {
    setFuture((currentFuture) => {
      const next = currentFuture[0]
      if (!next) {
        return currentFuture
      }

      setEditor((current) => {
        setPast((currentPast) => [...currentPast.slice(-(HISTORY_LIMIT - 1)), current])
        return next
      })
      return currentFuture.slice(1)
    })
  }

  const handleRandomise = () => {
    const pool = activeBrand.swatches
    if (pool.length === 0) {
      return
    }

    const textSwatch = pickRandomSwatch(pool)
    const backgroundSwatch = pickRandomSwatch(pool, textSwatch.value)
    commitEditor((current) => ({
      ...current,
      textColor: textSwatch.value,
      backgroundColor: backgroundSwatch.value,
      transparentBackground: false
    }))
  }

  const handleInvert = () => {
    commitEditor((current) => ({
      ...current,
      textColor: current.backgroundColor,
      backgroundColor: current.textColor,
      transparentBackground: false
    }))
  }

  const handleExport = async () => {
    try {
      await ensureGoogleFontLoaded(editor.fontFamily)
      const exportLayout = computeLayout(editor)
      const exportFilename = buildFilename(activeBrand.name, editor, exportLayout)
      const { blob } = await exportGraphic(
        editor,
        exportLayout,
        editor.exportFormat,
        editor.exportQuality,
      )
      downloadBlob(blob, exportFilename, editor.exportFormat, exportLayout.width, exportLayout.height, editor.exportQuality, editor.transparentBackground)
      setStatusMessage(`Downloaded ${exportFilename}.`)
    } catch (error) {
      trackProcessingFailed('text-graphic', 'create_text_graphic', error)
      setStatusMessage(error instanceof Error ? error.message : 'Download failed.')
    }
  }

  const handleCopyToClipboard = async () => {
    if (!clipboardSupported) {
      setStatusMessage('This browser does not support image clipboard writes.')
      return
    }

    try {
      await ensureGoogleFontLoaded(editor.fontFamily)
      const exportLayout = computeLayout(editor)
      const { blob } = await exportGraphic(editor, exportLayout, 'png', 1)
      await copyBlobToClipboard(blob)
      trackEvent('image_copied', { tool: 'text-graphic', file_type: 'png', output_size_bytes: blob.size, output_width: exportLayout.width, output_height: exportLayout.height })
      setStatusMessage('Copied image to clipboard.')
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Clipboard copy failed.')
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCommand = event.metaKey || event.ctrlKey
      if (!isCommand) {
        return
      }

      const key = event.key.toLowerCase()
      if (key === 'enter') {
        event.preventDefault()
        void handleExport()
      }
      if (key === 'c' && event.shiftKey) {
        event.preventDefault()
        void handleCopyToClipboard()
      }
      if (key === 'z' && event.shiftKey) {
        event.preventDefault()
        handleRedo()
      } else if (key === 'z') {
        event.preventDefault()
        handleUndo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <div className="simple-tool simple-tool--text">
      <aside className="tool-drawer text-tool-drawer" aria-label="Text graphic controls">
        <div className="tool-drawer__heading">
          <img alt="Penguino holding a text tile" className="tool-drawer__art" src="/assets/penguino-text.webp" />
          <div><p>Create</p><h1>Text graphic</h1></div>
        </div>
        <p className="tool-drawer__intro">Make crisp graphics with saved brand colours, Google Fonts and exact pixel sizing.</p>
        <div className="control-rail">
          <BrandManager
            activeBrandId={editor.activeBrandId}
            brands={brands}
            collapsed={collapsedPanels.brand}
            onAddSwatch={handleAddSwatch}
            onCreateBrand={handleCreateBrand}
            onDefaultsApply={handleApplyBrandDefaults}
            onDefaultsSave={handleSaveCurrentAsDefaults}
            onDeleteBrand={handleDeleteBrand}
            onDuplicateBrand={handleDuplicateBrand}
            onExportBrands={handleExportBrands}
            onFontFamilyChange={handleBrandFontChange}
            onImportBrands={(file) => void handleImportBrands(file)}
            onRemoveSwatch={handleRemoveSwatch}
            onRenameBrand={handleRenameBrand}
            onSwatchRename={handleSwatchRename}
            onSwatchValueChange={handleSwatchValueChange}
            onSwitchBrand={handleSwitchBrand}
            onToggleCollapsed={() =>
              setCollapsedPanels((current) => ({ ...current, brand: !current.brand }))
            }
          />

          <TextControls
            collapsed={collapsedPanels.text}
            state={editor}
            onAddLine={handleAddLine}
            onFieldChange={handleFieldChange}
            onLineChange={handleLineChange}
            onRemoveLine={handleRemoveLine}
            onToggleCollapsed={() =>
              setCollapsedPanels((current) => ({ ...current, text: !current.text }))
            }
          />

          <ColorControls
            activeBrand={activeBrand}
            collapsed={collapsedPanels.colours}
            state={editor}
            onFieldChange={handleFieldChange}
            onInvert={handleInvert}
            onRandomise={handleRandomise}
            onToggleCollapsed={() =>
              setCollapsedPanels((current) => ({ ...current, colours: !current.colours }))
            }
          />

          <SizeControls
            collapsed={collapsedPanels.canvas}
            layout={layout}
            state={editor}
            onFieldChange={handleFieldChange}
            onToggleCollapsed={() =>
              setCollapsedPanels((current) => ({ ...current, canvas: !current.canvas }))
            }
          />

          <ExportControls
            clipboardSupported={clipboardSupported}
            collapsed={collapsedPanels.download}
            state={editor}
            onCopyToClipboard={() => void handleCopyToClipboard()}
            onFieldChange={handleFieldChange}
            onToggleCollapsed={() =>
              setCollapsedPanels((current) => ({ ...current, download: !current.download }))
            }
          />
        </div>
      </aside>

      <section className="work-canvas text-work-canvas" aria-label="Live canvas preview">
        <div className="work-canvas__header">
          <div><p>Live preview</p><h2>Export canvas</h2></div>
          <span>{layout.width} × {layout.height}px</span>
        </div>
        <div className="text-canvas-stage">
          <div className="preview-column">
            <PreviewStage
              layout={layout}
              previewTexture={editor.previewTexture}
              previewUrl={previewUrl}
              transparentBackground={editor.transparentBackground}
            />

            <div className="quick-export-bar">
              <div>
                <strong>{statusMessage}</strong>
                <p>{filename}.{editor.exportFormat === 'jpeg' ? 'jpg' : editor.exportFormat} · {estimatedSize}</p>
              </div>
              <div className="quick-export-bar__actions">
                <button className="secondary-button" onClick={handleRandomise} type="button">Random combo</button>
                <button className="secondary-button" onClick={handleInvert} type="button">Invert</button>
                <button className="penguino-action" onClick={() => void handleExport()} type="button">Download</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TextGraphicTool
