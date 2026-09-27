import { useEffect, useState } from 'react'
import DropZone from '../components/DropZone'
import Icon from '../components/Icon'
import { downloadImageBlob, formatBytes, imageToBlob, loadImageFile, type RasterFormat } from '../utils/imageFiles'

const ImageResizerTool = () => {
  const [file, setFile] = useState<File | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [width, setWidth] = useState(1200)
  const [height, setHeight] = useState(800)
  const [sourceWidth, setSourceWidth] = useState(0)
  const [sourceHeight, setSourceHeight] = useState(0)
  const [locked, setLocked] = useState(true)
  const [format, setFormat] = useState<RasterFormat>('webp')
  const [quality, setQuality] = useState(0.86)
  const [estimate, setEstimate] = useState('Add an image to begin')

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  const handleFile = async (nextFile: File) => {
    try {
      const loaded = await loadImageFile(nextFile)
      setFile(nextFile)
      setImage(loaded.image)
      setPreviewUrl((current) => { if (current) URL.revokeObjectURL(current); return loaded.url })
      setSourceWidth(loaded.image.naturalWidth)
      setSourceHeight(loaded.image.naturalHeight)
      setWidth(loaded.image.naturalWidth)
      setHeight(loaded.image.naturalHeight)
      setEstimate('Ready to resize')
    } catch (error) {
      setEstimate(error instanceof Error ? error.message : 'Could not open that image.')
    }
  }

  const changeWidth = (nextWidth: number) => {
    const safeWidth = Math.max(1, nextWidth || 1)
    setWidth(safeWidth)
    if (locked && sourceWidth) setHeight(Math.max(1, Math.round(safeWidth * sourceHeight / sourceWidth)))
  }

  const changeHeight = (nextHeight: number) => {
    const safeHeight = Math.max(1, nextHeight || 1)
    setHeight(safeHeight)
    if (locked && sourceHeight) setWidth(Math.max(1, Math.round(safeHeight * sourceWidth / sourceHeight)))
  }

  const handleDownload = async () => {
    if (!image || !file) return
    setEstimate('Preparing image...')
    try {
      const blob = await imageToBlob(image, width, height, format, quality)
      setEstimate(`${formatBytes(blob.size)} ready`)
      downloadImageBlob(blob, file.name, `${width}x${height}`, format)
    } catch (error) {
      setEstimate(error instanceof Error ? error.message : 'Resize failed.')
    }
  }

  return (
    <div className="simple-tool">
      <aside className="tool-drawer">
        <div className="tool-drawer__heading"><img alt="Penguino resizing an image" className="tool-drawer__art" src="/assets/penguino-resize.png" /><div><p>Resize</p><h1>Image resizer</h1></div></div>
        <DropZone accept="image/png,image/jpeg,image/webp" file={file} helpText="PNG, JPEG or WebP" onFile={(next) => void handleFile(next)} />
        <section className="drawer-section">
          <div className="drawer-section__title"><h2>Dimensions</h2>{sourceWidth ? <span>{sourceWidth} × {sourceHeight}px</span> : null}</div>
          <div className="dimension-grid">
            <label className="field"><span>Width (px)</span><input min="1" onChange={(event) => changeWidth(Number(event.target.value))} type="number" value={width} /></label>
            <button aria-label={locked ? 'Unlock proportions' : 'Lock proportions'} className={`ratio-lock ${locked ? 'ratio-lock--active' : ''}`} onClick={() => setLocked((current) => !current)} type="button">{locked ? 'Linked' : 'Free'}</button>
            <label className="field"><span>Height (px)</span><input min="1" onChange={(event) => changeHeight(Number(event.target.value))} type="number" value={height} /></label>
          </div>
          <div className="preset-row">
            {[600, 1080, 1200, 1920].map((preset) => <button className="chip-button" key={preset} onClick={() => changeWidth(preset)} type="button">{preset}px</button>)}
          </div>
        </section>
        <section className="drawer-section">
          <h2>Export</h2>
          <label className="field"><span>Format</span><select onChange={(event) => setFormat(event.target.value as RasterFormat)} value={format}><option value="webp">WebP</option><option value="jpeg">JPEG</option><option value="png">PNG</option></select></label>
          {format !== 'png' ? <label className="field"><span>Quality {Math.round(quality * 100)}%</span><input max="1" min="0.2" onChange={(event) => setQuality(Number(event.target.value))} step="0.01" type="range" value={quality} /></label> : null}
        </section>
        <button className="penguino-action" disabled={!image} onClick={() => void handleDownload()} type="button"><Icon name="download" /> Download resized image</button>
        <p className="tool-status">{estimate}</p>
      </aside>
      <section className="work-canvas">
        <div className="work-canvas__header"><div><p>Live preview</p><h2>{file?.name ?? 'Your image will appear here'}</h2></div>{image ? <span>{width} × {height}px</span> : null}</div>
        <div className="image-stage">{previewUrl ? <img alt="Resize preview" src={previewUrl} /> : <div className="empty-canvas"><span><Icon name="image" /></span><h3>Choose an image</h3><p>Upload a file to preview and resize it.</p></div>}</div>
      </section>
    </div>
  )
}

export default ImageResizerTool
