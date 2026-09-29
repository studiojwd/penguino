import { useRef, useState } from 'react'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import Icon from '../components/Icon'
import { downloadBlobFile, safeFileStem } from '../utils/downloads'
import { formatBytes } from '../utils/imageFiles'
import { trackFileSelected, trackProcessingFailed } from '../utils/analytics'

type CompressionLevel = 'small' | 'balanced' | 'quality'

const LEVELS: Record<CompressionLevel, { label: string; detail: string; scale: number; quality: number }> = {
  small: { label: 'Smaller file', detail: 'Best for email and quick sharing', scale: 1, quality: 0.52 },
  balanced: { label: 'Balanced', detail: 'Good quality with useful savings', scale: 1.35, quality: 0.7 },
  quality: { label: 'Higher quality', detail: 'Sharper pages with lighter compression', scale: 1.75, quality: 0.84 }
}

const canvasToJpeg = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not render a PDF page.')), 'image/jpeg', quality))

const PdfCompressorTool = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [level, setLevel] = useState<CompressionLevel>('balanced')
  const [status, setStatus] = useState('Choose a PDF to begin.')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ blob: Blob; pages: number } | null>(null)

  const handleFile = (nextFile: File) => {
    if (nextFile.type !== 'application/pdf') {
      setStatus('Please choose a PDF file.')
      return
    }
    void trackFileSelected(nextFile, { tool: 'pdf-compressor' })
    setFile(nextFile)
    setResult(null)
    setProgress(0)
    setStatus(`${formatBytes(nextFile.size)} · ready to compress`)
  }

  const handleCompress = async () => {
    if (!file) return
    setResult(null)
    setProgress(0)
    setStatus('Opening PDF...')
    try {
      const [{ PDFDocument }, pdfjs] = await Promise.all([import('pdf-lib'), import('pdfjs-dist')])
      pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) })
      const source = await loadingTask.promise
      const pageCount = source.numPages
      const output = await PDFDocument.create()
      const settings = LEVELS[level]

      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
        setStatus(`Compressing page ${pageNumber} of ${pageCount}...`)
        setProgress(Math.round(((pageNumber - 1) / pageCount) * 100))
        const sourcePage = await source.getPage(pageNumber)
        const pageSize = sourcePage.getViewport({ scale: 1 })
        const viewport = sourcePage.getViewport({ scale: settings.scale })
        const canvas = document.createElement('canvas')
        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)
        const context = canvas.getContext('2d', { alpha: false })
        if (!context) throw new Error('Canvas is unavailable.')
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, canvas.width, canvas.height)
        await sourcePage.render({ canvas, canvasContext: context, viewport }).promise
        const jpeg = await canvasToJpeg(canvas, settings.quality)
        const embedded = await output.embedJpg(await jpeg.arrayBuffer())
        const outputPage = output.addPage([pageSize.width, pageSize.height])
        outputPage.drawImage(embedded, { x: 0, y: 0, width: pageSize.width, height: pageSize.height })
        sourcePage.cleanup()
      }

      await loadingTask.destroy()
      const bytes = await output.save({ useObjectStreams: true })
      const pdfBuffer = new Uint8Array(bytes.length)
      pdfBuffer.set(bytes)
      const blob = new Blob([pdfBuffer.buffer], { type: 'application/pdf' })
      setResult({ blob, pages: pageCount })
      setProgress(100)
      const difference = file.size ? Math.round((1 - blob.size / file.size) * 100) : 0
      setStatus(difference > 0 ? `${formatBytes(blob.size)} · ${difference}% smaller` : `${formatBytes(blob.size)} · this PDF did not become smaller`)
    } catch (error) {
      trackProcessingFailed('pdf-compressor', 'compress_pdf', error)
      setStatus(error instanceof Error ? error.message : 'PDF compression failed.')
    }
  }

  const handleDownload = () => {
    if (!file || !result) return
    downloadBlobFile(result.blob, `${safeFileStem(file.name)}_compressed.pdf`, { input_size_bytes: file.size, operation: 'compress_pdf', file_count: 1, page_count: result.pages, compression_level: level })
  }

  return (
    <div className="simple-tool">
      <aside className="tool-drawer">
        <div className="tool-drawer__heading"><span aria-label="Penguino compressing a PDF" className="tool-drawer__art tool-drawer__art--quad-sprite tool-drawer__art--pdf" role="img" /><div><p>Compress</p><h1>PDF compressor</h1></div></div>
        <div className="drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const next = event.dataTransfer.files[0]; if (next) handleFile(next) }}><input ref={inputRef} accept="application/pdf" className="visually-hidden" onChange={(event) => { const next = event.target.files?.[0]; if (next) handleFile(next); event.target.value = '' }} type="file" /><span className="drop-zone__icon"><Icon name="upload" /></span><strong>{file?.name ?? 'Drop a PDF here'}</strong><p>{file ? formatBytes(file.size) : 'Your file stays in this browser'}</p><button className="secondary-button" onClick={() => inputRef.current?.click()} type="button">{file ? 'Choose another' : 'Choose PDF'}</button></div>
        <section className="drawer-section"><h2>Compression</h2><div className="compression-options">{(Object.entries(LEVELS) as Array<[CompressionLevel, typeof LEVELS[CompressionLevel]]>).map(([key, option]) => <button className={level === key ? 'format-option format-option--active' : 'format-option'} key={key} onClick={() => { setLevel(key); setResult(null) }} type="button"><strong>{option.label}</strong><span>{option.detail}</span></button>)}</div></section>
        <p className="pdf-warning"><strong>Important:</strong> compressed pages become images. Selectable text, links, forms and accessibility structure will be flattened.</p>
        {!result ? <button className="penguino-action" disabled={!file} onClick={() => void handleCompress()} type="button"><Icon name="pdf" /> Compress PDF</button> : <button className="penguino-action" onClick={handleDownload} type="button"><Icon name="download" /> Download compressed PDF</button>}
        {progress > 0 && progress < 100 ? <div className="progress-track"><span style={{ width: `${progress}%` }} /></div> : null}<p className="tool-status">{status}</p>
      </aside>
      <section className="work-canvas"><div className="work-canvas__header"><div><p>Document</p><h2>{file?.name ?? 'Your PDF will appear here'}</h2></div>{result ? <span>{result.pages} pages · {formatBytes(result.blob.size)}</span> : null}</div><div className="pdf-stage">{file ? <div className="pdf-file-card"><span><Icon name="pdf" /></span><h3>{file.name}</h3><p>{formatBytes(file.size)} original</p>{result ? <><Icon name="arrow" /><strong>{formatBytes(result.blob.size)} compressed</strong></> : <small>Choose a compression level, then process the file.</small>}</div> : <div className="empty-canvas"><span><Icon name="pdf" /></span><h3>Add a PDF</h3><p>Compress it locally without uploading the document.</p></div>}</div></section>
    </div>
  )
}

export default PdfCompressorTool
