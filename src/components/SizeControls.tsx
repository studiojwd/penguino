import { useEffect, useState } from 'react'
import { EXPORT_WIDTH_PRESETS } from '../constants'
import type { EditorState, LayoutResult } from '../types'
import Panel from './Panel'

interface SizeControlsProps {
  state: EditorState
  layout: LayoutResult
  collapsed: boolean
  onFieldChange: <K extends keyof EditorState>(field: K, value: EditorState[K]) => void
  onToggleCollapsed: () => void
}

const MIN_EXPORT_WIDTH = 1
const SizeControls = ({
  state,
  layout,
  collapsed,
  onFieldChange,
  onToggleCollapsed
}: SizeControlsProps) => {
  const [widthInput, setWidthInput] = useState(String(state.exportWidth))

  useEffect(() => {
    setWidthInput(String(state.exportWidth))
  }, [state.exportWidth])

  const commitExportWidth = () => {
    const parsed = Number(widthInput)
    const nextWidth =
      widthInput.trim() === '' || !Number.isFinite(parsed)
        ? state.exportWidth
        : Math.max(MIN_EXPORT_WIDTH, parsed)
    onFieldChange('exportWidth', nextWidth)
    setWidthInput(String(nextWidth))
  }

  return (
    <Panel
      title="Canvas"
      eyebrow="Canvas and guides"
      collapsible
      collapsed={collapsed}
      onToggle={onToggleCollapsed}
    >
      <div className="quick-preset-grid">
        {EXPORT_WIDTH_PRESETS.map((preset) => (
          <button
            className={state.exportWidth === preset.width ? 'secondary-button quick-preset-grid__active' : 'ghost-button'}
            key={preset.id}
            onClick={() => onFieldChange('exportWidth', preset.width)}
            type="button"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <label className="field">
        <span>Canvas width (px)</span>
        <input
          inputMode="numeric"
          min={MIN_EXPORT_WIDTH}
          step={10}
          type="number"
          value={widthInput}
          onBlur={commitExportWidth}
          onChange={(event) => setWidthInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commitExportWidth()
          }}
        />
      </label>

      <label className="toggle">
        <input
          checked={state.showSafeGuide}
          type="checkbox"
          onChange={(event) => onFieldChange('showSafeGuide', event.target.checked)}
        />
        <span>Show 24px safe-area guide</span>
      </label>

      <div className={`note ${layout.hasOverflow ? 'note--warning' : ''}`}>
        <strong>Preview/export match:</strong> {layout.width} x {layout.height}px
        <br />
        <strong>Text box:</strong> {Math.round(layout.textBoxWidth)}px
        {layout.hasOverflow ? (
          <>
            <br />
            <strong>Overflow warning:</strong> {layout.overflowWord} is wider than the text box.
          </>
        ) : null}
      </div>
    </Panel>
  )
}

export default SizeControls
