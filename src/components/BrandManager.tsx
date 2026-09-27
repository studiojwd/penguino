import { useRef } from 'react'
import { GOOGLE_FONT_OPTIONS } from '../constants'
import type { BrandPreset } from '../types'
import Panel from './Panel'

interface BrandManagerProps {
  brands: BrandPreset[]
  activeBrandId: string
  collapsed: boolean
  onSwitchBrand: (brandId: string) => void
  onToggleCollapsed: () => void
  onCreateBrand: () => void
  onDuplicateBrand: () => void
  onDeleteBrand: () => void
  onRenameBrand: (name: string) => void
  onFontFamilyChange: (value: string) => void
  onDefaultsApply: () => void
  onDefaultsSave: () => void
  onSwatchRename: (swatchId: string, value: string) => void
  onSwatchValueChange: (swatchId: string, value: string) => void
  onAddSwatch: () => void
  onRemoveSwatch: (swatchId: string) => void
  onExportBrands: () => void
  onImportBrands: (file: File) => void
}

const BrandManager = ({
  brands,
  activeBrandId,
  collapsed,
  onSwitchBrand,
  onToggleCollapsed,
  onCreateBrand,
  onDuplicateBrand,
  onDeleteBrand,
  onRenameBrand,
  onFontFamilyChange,
  onDefaultsApply,
  onDefaultsSave,
  onSwatchRename,
  onSwatchValueChange,
  onAddSwatch,
  onRemoveSwatch,
  onExportBrands,
  onImportBrands
}: BrandManagerProps) => {
  const activeBrand = brands.find((brand) => brand.id === activeBrandId) ?? brands[0]
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  return (
    <Panel
      title="Brand"
      eyebrow="Local presets"
      collapsible
      collapsed={collapsed}
      onToggle={onToggleCollapsed}
    >
      <input
        accept="application/json"
        hidden
        ref={fileInputRef}
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) {
            onImportBrands(file)
          }
          event.target.value = ''
        }}
      />

      <label className="field">
        <span>Active brand</span>
        <select value={activeBrand.id} onChange={(event) => onSwitchBrand(event.target.value)}>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </label>

      <div className="brand-utility-row">
        <button className="ghost-button" onClick={onCreateBrand} type="button">New</button>
        <button className="ghost-button" onClick={onDuplicateBrand} type="button">Duplicate</button>
        <button className="ghost-button" onClick={onExportBrands} type="button">Export</button>
        <button className="ghost-button" onClick={() => fileInputRef.current?.click()} type="button">Import</button>
      </div>

      <div className="split-fields">
        <label className="field">
          <span>Brand name</span>
          <input
            type="text"
            value={activeBrand.name}
            onChange={(event) => onRenameBrand(event.target.value)}
          />
        </label>

        <label className="field">
          <span>Google Font</span>
          <select
            value={activeBrand.defaults.fontFamily}
            onChange={(event) => onFontFamilyChange(event.target.value)}
          >
            {GOOGLE_FONT_OPTIONS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="inline-actions">
        <button className="secondary-button" onClick={onDefaultsApply} type="button">
          Apply defaults
        </button>
        <button className="secondary-button" onClick={onDefaultsSave} type="button">
          Save as defaults
        </button>
        <button
          className="danger-button"
          disabled={brands.length === 1}
          onClick={onDeleteBrand}
          type="button"
        >
          Delete brand
        </button>
      </div>

      <div className="swatch-header">
        <div>
          <h3>Swatches</h3>
          <p>Name and fine-tune your reusable brand colours.</p>
        </div>
        <button className="ghost-button" onClick={onAddSwatch} type="button">
          + Add
        </button>
      </div>

      <div className="swatch-list">
        {activeBrand.swatches.map((swatch, index) => (
          <div className="swatch-item" key={swatch.id}>
            <input
              aria-label={`Name for swatch ${index + 1}`}
              className="swatch-item__name"
              type="text"
              value={swatch.name}
              onChange={(event) => onSwatchRename(swatch.id, event.target.value)}
            />
            <input
              aria-label={`Value for swatch ${index + 1}`}
              className="swatch-item__color"
              type="color"
              value={toHexColor(swatch.value)}
              onChange={(event) => onSwatchValueChange(swatch.id, event.target.value)}
            />
            <button aria-label={`Remove swatch ${index + 1}`} className="icon-button" onClick={() => onRemoveSwatch(swatch.id)} type="button">
              ×
            </button>
          </div>
        ))}
      </div>
    </Panel>
  )
}

const toHexColor = (value: string) => {
  if (value.startsWith('#')) {
    return value
  }

  const match = value.match(/\d+/g)
  if (!match || match.length < 3) {
    return '#000000'
  }

  return `#${match
    .slice(0, 3)
    .map((part) => Number(part).toString(16).padStart(2, '0'))
    .join('')}`
}

export default BrandManager
