import type { CSSProperties } from 'react'
import type { BrandPreset, EditorState } from '../types'
import { getContrastRatio } from '../utils/contrast'
import Panel from './Panel'

interface ColorControlsProps {
  activeBrand: BrandPreset
  state: EditorState
  collapsed: boolean
  onFieldChange: <K extends keyof EditorState>(field: K, value: EditorState[K]) => void
  onRandomise: () => void
  onInvert: () => void
  onToggleCollapsed: () => void
}

const ColorControls = ({
  activeBrand,
  state,
  collapsed,
  onFieldChange,
  onRandomise,
  onInvert,
  onToggleCollapsed
}: ColorControlsProps) => {
  const contrastRatio =
    state.transparentBackground ? null : getContrastRatio(state.textColor, state.backgroundColor)

  return (
    <Panel
      title="Colours"
      eyebrow="Palette and contrast"
      collapsible
      collapsed={collapsed}
      onToggle={onToggleCollapsed}
      actions={
        <>
          <button className="ghost-button" onClick={onRandomise} type="button">
            Random combo
          </button>
          <button className="ghost-button" onClick={onInvert} type="button">
            Invert
          </button>
        </>
      }
    >
      <div className="stack">
        <label className="field">
          <span>Text colour</span>
          <div className="color-input">
            <input
              type="color"
              value={toHexColor(state.textColor)}
              onChange={(event) => onFieldChange('textColor', event.target.value)}
            />
            <input
              type="text"
              value={state.textColor}
              onChange={(event) => onFieldChange('textColor', event.target.value)}
            />
          </div>
          <div className="swatch-picker" role="list" aria-label="Text colour swatches">
            {activeBrand.swatches.map((swatch) => (
              <button
                aria-pressed={state.textColor === swatch.value}
                className={`swatch-picker__option ${
                  state.textColor === swatch.value ? 'swatch-picker__option--active' : ''
                } ${swatch.favorite ? 'swatch-picker__option--favorite' : ''}`}
                key={`text-${swatch.id}`}
                onClick={() => onFieldChange('textColor', swatch.value)}
                style={{ '--swatch-color': swatch.value } as CSSProperties}
                type="button"
              >
                <span className="swatch-picker__chip" />
                <span>{swatch.name}</span>
              </button>
            ))}
          </div>
        </label>

        <label className="field">
          <span>Background colour</span>
          <div className="color-input">
            <input
              disabled={state.transparentBackground}
              type="color"
              value={toHexColor(state.backgroundColor)}
              onChange={(event) => onFieldChange('backgroundColor', event.target.value)}
            />
            <input
              disabled={state.transparentBackground}
              type="text"
              value={state.backgroundColor}
              onChange={(event) => onFieldChange('backgroundColor', event.target.value)}
            />
          </div>
          <div className="swatch-picker" role="list" aria-label="Background colour swatches">
            {activeBrand.swatches.map((swatch) => (
              <button
                aria-pressed={!state.transparentBackground && state.backgroundColor === swatch.value}
                className={`swatch-picker__option ${
                  !state.transparentBackground && state.backgroundColor === swatch.value
                    ? 'swatch-picker__option--active'
                    : ''
                } ${swatch.favorite ? 'swatch-picker__option--favorite' : ''}`}
                key={`background-${swatch.id}`}
                onClick={() => {
                  onFieldChange('backgroundColor', swatch.value)
                  onFieldChange('transparentBackground', false)
                }}
                style={{ '--swatch-color': swatch.value } as CSSProperties}
                type="button"
              >
                <span className="swatch-picker__chip" />
                <span>{swatch.name}</span>
              </button>
            ))}
          </div>
        </label>
      </div>

      <label className="toggle">
        <input
          checked={state.transparentBackground}
          type="checkbox"
          onChange={(event) => onFieldChange('transparentBackground', event.target.checked)}
        />
        <span>Transparent background</span>
      </label>

      {contrastRatio !== null && contrastRatio < 3 ? (
        <p className="contrast-warning">Low contrast. Try a stronger text and background pairing.</p>
      ) : null}
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

export default ColorControls
