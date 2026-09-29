import { useEffect, useState } from 'react'
import DropZone from '../components/DropZone'
import Icon from '../components/Icon'
import { trackProcessingFailed } from '../utils/analytics'
import { canvasToBlob } from '../utils/canvas'
import { downloadBlobFile, safeFileStem } from '../utils/downloads'
import { loadImageFile, type RasterFormat } from '../utils/imageFiles'

const ImageSplitterTool = () => {
  const [file, setFile] = useState<File | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [columns, setColumns] = useState(3)
  const [rows, setRows] = useState(1)
  const [format, setFormat] = useState<RasterFormat>('png')
  const [quality, setQuality] = useState(0.9)
  const [prefix, setPrefix] = useState('tile')
  const [status, setStatus] = useState('Choose an image and split it into a grid.')

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  const handleFile = async (nextFile: File) => {
    try {
      const loaded = await loadImageFile(nextFile)
      setFile(nextFile)
      setImage(loaded.image)
      setPreviewUrl((current) => { if (current) URL.revokeObjectURL(current); return loaded.url })
      setStatus(`${loaded.image.naturalWidth} × ${loaded.image.naturalHeight}px ready to split.`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not open that image.')
    }
  }

  const handleSplit = async () => {
    if (!image || !file) return
    const total = columns * rows
    setStatus(`Creating ${total} image tiles...`)
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      const extension = format === 'jpeg' ? 'jpg' : format
      for (let row = 0; row < rows; row += 1) {
        const sourceY = Math.round(row * image.naturalHeight / rows)
        const sourceBottom = Math.round((row + 1) * image.naturalHeight / rows)
        for (let column = 0; column < columns; column += 1) {
          const sourceX = Math.round(column * image.naturalWidth / columns)
          const sourceRight = Math.round((column + 1) * image.naturalWidth / columns)
          const canvas = document.createElement('canvas')
          canvas.width = sourceRight - sourceX
          canvas.height = sourceBottom - sourceY
          const context = canvas.getContext('2d')
          if (!context) throw new Error('Canvas is unavailable in this browser.')
          if (format === 'jpeg') {
            context.fillStyle = '#ffffff'
            context.fillRect(0, 0, canvas.width, canvas.height)
          }
          context.drawImage(image, sourceX, sourceY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height)
          const blob = await canvasToBlob(canvas, format, quality)
          zip.file(`${safeFileStem(prefix)}_r${row + 1}_c${column + 1}.${extension}`, blob)
        }
      }
      const output = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
      downloadBlobFile(output, `${safeFileStem(file.name)}_${columns}x${rows}_split.zip`, { input_size_bytes: file.size, operation: 'split_image', file_count: total, grid_columns: columns, grid_rows: rows, contained_format: format })
      setStatus(`${total} tiles downloaded in one ZIP.`)
    } catch (error) {
      trackProcessingFailed('image-splitter', 'split_image', error)
      setStatus(error instanceof Error ? error.message : 'The image could not be split.')
    }
  }

  return <div className="simple-tool">
    <aside className="tool-drawer">
      <div className="tool-drawer__heading"><img alt="Penguino splitting an image into tiles" className="tool-drawer__art" src="/assets/penguino-image-splitter.webp" /><div><p>Divide</p><h1>Image splitter</h1></div></div>
      <DropZone accept="image/png,image/jpeg,image/webp" file={file} helpText="PNG, JPEG or WebP" onFile={(next) => void handleFile(next)} />
      <section className="drawer-section"><h2>Grid</h2><div className="split-fields"><label className="field"><span>Columns</span><input max="6" min="1" type="number" value={columns} onChange={(event) => setColumns(Math.min(6, Math.max(1, Number(event.target.value) || 1)))} /></label><label className="field"><span>Rows</span><input max="6" min="1" type="number" value={rows} onChange={(event) => setRows(Math.min(6, Math.max(1, Number(event.target.value) || 1)))} /></label></div><div className="preset-row"><button className="chip-button" onClick={() => { setColumns(3); setRows(1) }} type="button">3 × 1</button><button className="chip-button" onClick={() => { setColumns(2); setRows(2) }} type="button">2 × 2</button><button className="chip-button" onClick={() => { setColumns(3); setRows(3) }} type="button">3 × 3</button></div></section>
      <section className="drawer-section"><h2>Export</h2><label className="field"><span>Filename prefix</span><input value={prefix} onChange={(event) => setPrefix(event.target.value)} /></label><label className="field"><span>Format</span><select value={format} onChange={(event) => setFormat(event.target.value as RasterFormat)}><option value="png">PNG</option><option value="jpeg">JPEG</option><option value="webp">WebP</option></select></label>{format !== 'png' ? <label className="field"><span>Quality {Math.round(quality * 100)}%</span><input max="1" min="0.3" step="0.01" type="range" value={quality} onChange={(event) => setQuality(Number(event.target.value))} /></label> : null}</section>
      <button className="penguino-action" disabled={!image} onClick={() => void handleSplit()} type="button"><Icon name="archive" /> Download {columns * rows} tiles as ZIP</button><p aria-live="polite" className="tool-status">{status}</p>
    </aside>
    <section className="work-canvas"><div className="work-canvas__header"><div><p>Split preview</p><h2>{file?.name ?? 'Your image will appear here'}</h2></div><span>{columns} × {rows} · {columns * rows} tiles</span></div><div className="splitter-stage">{previewUrl ? <div className="splitter-preview"><img alt="Image split preview" src={previewUrl} /><div aria-hidden="true" className="splitter-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>{Array.from({ length: columns * rows }, (_, index) => <span key={index}>{index + 1}</span>)}</div></div> : <div className="empty-canvas"><span><Icon name="split" /></span><h3>Choose an image</h3><p>Set the number of rows and columns to preview each tile.</p></div>}</div></section>
  </div>
}

export default ImageSplitterTool
