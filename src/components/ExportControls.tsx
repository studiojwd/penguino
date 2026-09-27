import { EXPORT_SCALE_OPTIONS } from '../constants'
import type { EditorState } from '../types'
import Panel from './Panel'

interface ExportControlsProps {
  state: EditorState
  clipboardSupported: boolean
  collapsed: boolean
  onFieldChange: <K extends keyof EditorState>(field: K, value: EditorState[K]) => void
  onCopyToClipboard: () => void
  onToggleCollapsed: () => void
}

const ExportControls = ({
  state,
  clipboardSupported,
  collapsed,
  onFieldChange,
  onCopyToClipboard,
  onToggleCollapsed
}: ExportControlsProps) => (
  <Panel
    title="Download"
    eyebrow="Download and share"
    collapsible
    collapsed={collapsed}
    onToggle={onToggleCollapsed}
  >
    <div className="field">
      <span>Format</span>
      <div className="segmented">
        {(['png', 'jpeg', 'webp'] as const).map((format) => (
          <button
            className={state.exportFormat === format ? 'segmented__active' : ''}
            key={format}
            onClick={() => onFieldChange('exportFormat', format)}
            type="button"
          >
            {format.toUpperCase()}
          </button>
        ))}
      </div>
    </div>

    <div className="split-fields">
      <label className="field">
        <span>{`Quality: ${Math.round(state.exportQuality * 100)}%`}</span>
        <input
          disabled={state.exportFormat === 'png'}
          max={1}
          min={0.4}
          step={0.01}
          type="range"
          value={state.exportQuality}
          onChange={(event) => onFieldChange('exportQuality', Number(event.target.value))}
        />
      </label>

      <div className="field">
        <span>Export scale</span>
        <div className="segmented segmented--triple">
          {EXPORT_SCALE_OPTIONS.map((scale) => (
            <button
              className={state.exportScale === scale ? 'segmented__active' : ''}
              key={scale}
              onClick={() => onFieldChange('exportScale', scale)}
              type="button"
            >
              {scale}x
            </button>
          ))}
        </div>
      </div>
    </div>

    <div className="inline-actions">
      <button
        className="secondary-button"
        disabled={!clipboardSupported}
        onClick={onCopyToClipboard}
        type="button"
      >
        Copy image
      </button>
    </div>

    <p className="note">
      JPEG exports automatically flatten transparent backgrounds to the current background colour.
    </p>
  </Panel>
)

export default ExportControls
