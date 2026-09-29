import { useRef, useState } from 'react'
import Icon from '../components/Icon'
import { downloadBlobFile, safeFileStem } from '../utils/downloads'
import { formatBytes, imageToBlob, loadImageFile, type RasterFormat } from '../utils/imageFiles'
import { trackEvent } from '../utils/analytics'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_FILES = 10
type ResizeMode = 'width' | 'height' | 'exact'

const BulkImageResizerTool = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [width, setWidth] = useState(1200)
  const [height, setHeight] = useState(1200)
  const [resizeMode, setResizeMode] = useState<ResizeMode>('width')
  const [doNotEnlarge, setDoNotEnlarge] = useState(true)
  const [format, setFormat] = useState<RasterFormat>('webp')
  const [quality, setQuality] = useState(0.86)
  const [prefix, setPrefix] = useState('')
  const [status, setStatus] = useState('Add multiple images to resize them together.')

  const addFiles = (incoming: FileList | File[]) => {
    const accepted = Array.from(incoming).filter((file) => ACCEPTED_TYPES.includes(file.type))
    const availableSlots = Math.max(0, MAX_FILES - files.length)
    const filesToAdd = accepted.slice(0, availableSlots)
    if (filesToAdd.length) trackEvent('file_selected', { tool: 'bulk-image-resizer', file_type: 'image', file_count: filesToAdd.length })
    setFiles((current) => [...current, ...filesToAdd])
    const skipped = accepted.length - filesToAdd.length
    setStatus(skipped > 0
      ? `${filesToAdd.length} added · ${skipped} skipped because the limit is ${MAX_FILES}.`
      : `${filesToAdd.length} image${filesToAdd.length === 1 ? '' : 's'} added.`)
  }

  const outputDimensions = (sourceWidth: number, sourceHeight: number) => {
    if (resizeMode === 'exact') return { width, height }
    const requestedScale = resizeMode === 'width' ? width / sourceWidth : height / sourceHeight
    const scale = doNotEnlarge ? Math.min(requestedScale, 1) : requestedScale
    return { width: Math.max(1, Math.round(sourceWidth * scale)), height: Math.max(1, Math.round(sourceHeight * scale)) }
  }

  const handleResize = async () => {
    if (files.length === 0) return
    setStatus(`Resizing 0 of ${files.length}...`)
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index]
        setStatus(`Resizing ${index + 1} of ${files.length}...`)
        const { image, url } = await loadImageFile(file)
        try {
          const dimensions = outputDimensions(image.naturalWidth, image.naturalHeight)
          const blob = await imageToBlob(image, dimensions.width, dimensions.height, format, quality)
          const extension = format === 'jpeg' ? 'jpg' : format
          const cleanPrefix = prefix.trim() ? `${safeFileStem(prefix)}_` : ''
          zip.file(`${cleanPrefix}${safeFileStem(file.name)}_${dimensions.width}x${dimensions.height}.${extension}`, blob)
        } finally {
          URL.revokeObjectURL(url)
        }
      }
      const output = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
      downloadBlobFile(output, `${prefix.trim() ? `${safeFileStem(prefix)}_` : ''}penguino_resized_${files.length}_images.zip`)
      setStatus(`Downloaded ${files.length} images · ${formatBytes(output.size)} ZIP.`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Bulk resize failed.')
    }
  }

  return (
    <div className="simple-tool">
      <aside className="tool-drawer">
        <div className="tool-drawer__heading"><img alt="Penguino resizing multiple images" className="tool-drawer__art tool-drawer__art--sprite" src="/assets/penguino-new-tools.webp" style={{ objectPosition: 'center' }} /><div><p>Resize</p><h1>Bulk image resizer</h1></div></div>
        <div className="drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files) }}>
          <input ref={inputRef} accept={ACCEPTED_TYPES.join(',')} className="visually-hidden" multiple onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.target.value = '' }} type="file" />
          <span className="drop-zone__icon"><Icon name="upload" /></span><strong>Drop images here</strong><p>PNG, JPEG or WebP · up to {MAX_FILES} files</p><button className="secondary-button" disabled={files.length >= MAX_FILES} onClick={() => inputRef.current?.click()} type="button">{files.length >= MAX_FILES ? '10 file limit reached' : 'Choose images'}</button>
        </div>
        <section className="drawer-section"><h2>Resize by</h2><div className="resize-mode-options" role="group" aria-label="Resize by"><button className={resizeMode === 'width' ? 'resize-mode resize-mode--active' : 'resize-mode'} onClick={() => setResizeMode('width')} type="button"><strong>Width</strong><span>Height auto</span></button><button className={resizeMode === 'height' ? 'resize-mode resize-mode--active' : 'resize-mode'} onClick={() => setResizeMode('height')} type="button"><strong>Height</strong><span>Width auto</span></button><button className={resizeMode === 'exact' ? 'resize-mode resize-mode--active' : 'resize-mode'} onClick={() => setResizeMode('exact')} type="button"><strong>Exact</strong><span>May stretch</span></button></div><div className="split-fields"><label className="field"><span>Width (px){resizeMode === 'height' ? ' · auto' : ''}</span><input disabled={resizeMode === 'height'} min="1" type={resizeMode === 'height' ? 'text' : 'number'} value={resizeMode === 'height' ? 'Auto per image' : width} onChange={(event) => setWidth(Math.max(1, Number(event.target.value) || 1))} /></label><label className="field"><span>Height (px){resizeMode === 'width' ? ' · auto' : ''}</span><input disabled={resizeMode === 'width'} min="1" type={resizeMode === 'width' ? 'text' : 'number'} value={resizeMode === 'width' ? 'Auto per image' : height} onChange={(event) => setHeight(Math.max(1, Number(event.target.value) || 1))} /></label></div><label className="toggle"><input checked={doNotEnlarge} disabled={resizeMode === 'exact'} type="checkbox" onChange={(event) => setDoNotEnlarge(event.target.checked)} /><span>Do not enlarge smaller images</span></label></section>
        <section className="drawer-section"><h2>Export</h2><label className="field"><span>Filename prefix <small>Optional</small></span><input placeholder="e.g. campaign" type="text" value={prefix} onChange={(event) => setPrefix(event.target.value)} /></label><label className="field"><span>Format</span><select value={format} onChange={(event) => setFormat(event.target.value as RasterFormat)}><option value="webp">WebP</option><option value="jpeg">JPEG</option><option value="png">PNG</option></select></label>{format !== 'png' ? <label className="field"><span>Quality {Math.round(quality * 100)}%</span><input max="1" min="0.3" step="0.01" type="range" value={quality} onChange={(event) => setQuality(Number(event.target.value))} /></label> : null}</section>
        <button className="penguino-action" disabled={files.length === 0} onClick={() => void handleResize()} type="button"><Icon name="download" /> Resize and download ZIP</button><p aria-live="polite" className="tool-status">{status}</p>
      </aside>
      <section className="work-canvas"><div className="work-canvas__header"><div><p>Queue</p><h2>{files.length ? `${files.length} image${files.length === 1 ? '' : 's'} ready` : 'Your images will appear here'}</h2></div>{files.length ? <button className="ghost-button" onClick={() => setFiles([])} type="button">Clear all</button> : null}</div><div className="bulk-stage">{files.length ? <div className="bulk-file-list">{files.map((file, index) => <div className="bulk-file" key={`${file.name}-${file.lastModified}-${index}`}><span><Icon name="image" /></span><div><strong>{file.name}</strong><p>{formatBytes(file.size)}</p></div><button aria-label={`Remove ${file.name}`} onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))} type="button">×</button></div>)}</div> : <div className="empty-canvas"><span><Icon name="layers" /></span><h3>Add multiple images</h3><p>Every image will use the same resize settings.</p></div>}</div></section>
    </div>
  )
}

export default BulkImageResizerTool
