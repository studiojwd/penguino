import { FONT_WEIGHT_OPTIONS, GOOGLE_FONT_OPTIONS, getSupportedFontWeights } from '../constants'
import type { EditorState } from '../types'
import Panel from './Panel'

interface TextControlsProps {
  state: EditorState
  collapsed: boolean
  onLineChange: (index: number, value: string) => void
  onAddLine: () => void
  onRemoveLine: (index: number) => void
  onFieldChange: <K extends keyof EditorState>(field: K, value: EditorState[K]) => void
  onToggleCollapsed: () => void
}

const TextControls = ({
  state,
  collapsed,
  onLineChange,
  onAddLine,
  onRemoveLine,
  onFieldChange,
  onToggleCollapsed
}: TextControlsProps) => {
  const supportedWeights = getSupportedFontWeights(state.fontFamily)
  const weightOptions = FONT_WEIGHT_OPTIONS.filter((option) => supportedWeights.includes(option.value))

  return (
    <Panel
      title="Text"
      eyebrow="Content and rhythm"
      collapsible
      collapsed={collapsed}
      onToggle={onToggleCollapsed}
    >
      <div className="stack">
        {state.lines.map((line, index) => (
          <div className="line-field line-field--simple" key={`line-${index}`}>
            <label className="field">
              <span>{`Line ${index + 1}`}</span>
              <input
                type="text"
                value={line}
                onChange={(event) => onLineChange(index, event.target.value)}
              />
            </label>
            <button
              aria-label={`Remove line ${index + 1}`}
              className="icon-button line-field__remove"
              disabled={state.lines.length === 1}
              onClick={() => onRemoveLine(index)}
              type="button"
            >
              X
            </button>
          </div>
        ))}
        <div className="inline-actions">
          <button className="secondary-button" onClick={onAddLine} type="button">
            + Add line
          </button>
        </div>
      </div>

      <div className="split-fields">
        <label className="field">
          <span>Font</span>
          <select
            value={state.fontFamily}
            onChange={(event) => onFieldChange('fontFamily', event.target.value)}
          >
            {GOOGLE_FONT_OPTIONS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Font size (px)</span>
          <input
            min={1}
            step={1}
            type="number"
            value={state.fontSizePx}
            onChange={(event) =>
              onFieldChange('fontSizePx', Math.max(1, Number(event.target.value) || 1))
            }
          />
        </label>
      </div>

      <div className="split-fields">
        <label className="field">
          <span>Text alignment</span>
          <select
            value={state.textAlign}
            onChange={(event) =>
              onFieldChange('textAlign', event.target.value as EditorState['textAlign'])
            }
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>

        <div className="field">
          <span>Text case</span>
          <div className="segmented segmented--quad">
            {(['none', 'uppercase', 'lowercase', 'titlecase'] as const).map((mode) => (
              <button
                className={state.textCase === mode ? 'segmented__active' : ''}
                key={mode}
                onClick={() => onFieldChange('textCase', mode)}
                type="button"
              >
                {mode === 'none'
                  ? 'Keep'
                  : mode === 'uppercase'
                    ? 'Upper'
                    : mode === 'lowercase'
                      ? 'Lower'
                      : 'Title'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="split-fields">
        <label className="field">
          <span>Font weight</span>
          <select
            value={state.fontWeight}
            onChange={(event) =>
              onFieldChange('fontWeight', Number(event.target.value) as EditorState['fontWeight'])
            }
          >
            {weightOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="split-fields">
        <label className="field">
          <span>{`Padding: ${Math.round(state.padding)}px`}</span>
          <input
            max={180}
            min={0}
            step={4}
            type="range"
            value={state.padding}
            onChange={(event) => onFieldChange('padding', Number(event.target.value))}
          />
        </label>

        <label className="field">
          <span>{`Text box width: ${Math.round(state.maxTextWidthPercent)}%`}</span>
          <input
            max={100}
            min={40}
            step={1}
            type="range"
            value={state.maxTextWidthPercent}
            onChange={(event) => onFieldChange('maxTextWidthPercent', Number(event.target.value))}
          />
        </label>
      </div>

      <div className="split-fields">
        <label className="field">
          <span>{`Line spacing: ${state.lineSpacing.toFixed(2)}`}</span>
          <input
            max={1.5}
            min={0.9}
            step={0.01}
            type="range"
            value={state.lineSpacing}
            onChange={(event) => onFieldChange('lineSpacing', Number(event.target.value))}
          />
        </label>

        <label className="field">
          <span>{`Letter spacing: ${state.letterSpacing.toFixed(1)}px`}</span>
          <input
            max={8}
            min={-1}
            step={0.1}
            type="range"
            value={state.letterSpacing}
            onChange={(event) => onFieldChange('letterSpacing', Number(event.target.value))}
          />
        </label>
      </div>

    </Panel>
  )
}

export default TextControls
