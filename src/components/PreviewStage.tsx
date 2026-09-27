import type { LayoutResult, PreviewTexture } from '../types'

interface PreviewStageProps {
  previewUrl: string
  layout: LayoutResult
  transparentBackground: boolean
  previewTexture: PreviewTexture
}

const PreviewStage = ({ previewUrl, layout, transparentBackground, previewTexture }: PreviewStageProps) => (
  <section className="preview-shell">
    <div className="preview-shell__header">
      <div>
        <p className="panel__eyebrow">Live preview</p>
        <h2>Export canvas</h2>
      </div>
      <div className="preview-shell__meta">
        <span>{layout.width}px wide</span>
        <span>{layout.height}px tall</span>
      </div>
    </div>

    <div className="preview-shell__body">
      <div
        className={`preview-stage preview-stage--${previewTexture} ${
          transparentBackground ? 'preview-stage--transparent' : ''
        }`}
        style={{ width: `min(100%, ${layout.width}px)` }}
      >
        <img alt="Graphic preview" src={previewUrl} />
      </div>
    </div>
  </section>
)

export default PreviewStage
