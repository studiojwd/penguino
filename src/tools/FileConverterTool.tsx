import { useEffect, useState } from 'react'
import DropZone from '../components/DropZone'
import Icon from '../components/Icon'
import { downloadImageBlob, formatBytes, imageToBlob, loadImageFile, type RasterFormat } from '../utils/imageFiles'

const FileConverterTool = () => {
  const [file, setFile] = useState<File | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [format, setFormat] = useState<RasterFormat>('webp')
  const [quality, setQuality] = useState(0.86)
  const [status, setStatus] = useState('Files are converted locally in your browser.')

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  const handleFile = async (nextFile: File) => {
    try {
      const loaded = await loadImageFile(nextFile)
      setFile(nextFile)
      setImage(loaded.image)
      setPreviewUrl((current) => { if (current) URL.revokeObjectURL(current); return loaded.url })
      setStatus(`${loaded.image.naturalWidth} × ${loaded.image.naturalHeight}px · ${formatBytes(nextFile.size)}`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not open that image.')
    }
  }

  const handleConvert = async () => {
    if (!image || !file) return
    setStatus('Converting...')
    try {
      const blob = await imageToBlob(image, image.naturalWidth, image.naturalHeight, format, quality)
      downloadImageBlob(blob, file.name, 'converted', format)
      setStatus(`Converted to ${format.toUpperCase()} · ${formatBytes(blob.size)}`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Conversion failed.')
    }
  }

  return (
    <div className="simple-tool">
      <aside className="tool-drawer">
        <div className="tool-drawer__heading"><img alt="Penguino converting JPG to PNG" className="tool-drawer__art" src="/assets/penguino-convert.png" /><div><p>Convert</p><h1>File converter</h1></div></div>
        <DropZone accept="image/png,image/jpeg,image/webp" file={file} helpText="PNG, JPEG or WebP" onFile={(next) => void handleFile(next)} />
        <section className="drawer-section">
          <h2>Convert to</h2>
          <div className="format-options">
            {(['webp', 'png', 'jpeg'] as RasterFormat[]).map((option) => (
              <button className={format === option ? 'format-option format-option--active' : 'format-option'} key={option} onClick={() => setFormat(option)} type="button"><strong>{option === 'jpeg' ? 'JPG' : option.toUpperCase()}</strong><span>{option === 'webp' ? 'Small and web-ready' : option === 'png' ? 'Lossless transparency' : 'Universal photos'}</span></button>
            ))}
          </div>
          {format !== 'png' ? <label className="field"><span>Quality {Math.round(quality * 100)}%</span><input max="1" min="0.2" onChange={(event) => setQuality(Number(event.target.value))} step="0.01" type="range" value={quality} /></label> : null}
        </section>
        <button className="penguino-action" disabled={!image} onClick={() => void handleConvert()} type="button"><Icon name="convert" /> Convert and download</button>
        <p className="tool-status">{status}</p>
      </aside>
      <section className="work-canvas">
        <div className="work-canvas__header"><div><p>Preview</p><h2>{file?.name ?? 'Your file will appear here'}</h2></div>{file ? <span>{file.type.replace('image/', '').toUpperCase()} → {format.toUpperCase()}</span> : null}</div>
        <div className="image-stage">{previewUrl ? <img alt="File conversion preview" src={previewUrl} /> : <div className="empty-canvas"><span><Icon name="convert" /></span><h3>Drop in an image</h3><p>Convert it without uploading it anywhere.</p></div>}</div>
      </section>
    </div>
  )
}

export default FileConverterTool
