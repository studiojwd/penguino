import { useRef, useState } from 'react'
import Icon from '../components/Icon'
import { downloadBlobFile, safeFileStem } from '../utils/downloads'
import { formatBytes } from '../utils/imageFiles'
import { trackEvent } from '../utils/analytics'

interface PdfItem {
  id: string
  file: File
  pages: number
}

type PdfMode = 'merge' | 'extract'
const MAX_FILES = 10

const parsePageSelection = (value: string, pageCount: number) => {
  const selected: number[] = []
  for (const part of value.split(',').map((item) => item.trim()).filter(Boolean)) {
    const match = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/)
    if (!match) throw new Error(`“${part}” is not a valid page or range.`)
    const start = Number(match[1])
    const end = Number(match[2] ?? match[1])
    if (start < 1 || end < 1 || start > pageCount || end > pageCount) throw new Error(`Choose pages between 1 and ${pageCount}.`)
    const direction = start <= end ? 1 : -1
    for (let page = start; direction > 0 ? page <= end : page >= end; page += direction) if (!selected.includes(page - 1)) selected.push(page - 1)
  }
  if (!selected.length) throw new Error('Enter at least one page number.')
  return selected
}

const pdfBlob = (bytes: Uint8Array) => {
  const copy = new Uint8Array(bytes.length)
  copy.set(bytes)
  return new Blob([copy.buffer], { type: 'application/pdf' })
}

const PdfMergeExtractTool = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<PdfItem[]>([])
  const [mode, setMode] = useState<PdfMode>('merge')
  const [extractSource, setExtractSource] = useState('')
  const [pageSelection, setPageSelection] = useState('1')
  const [filename, setFilename] = useState('penguino-document')
  const [status, setStatus] = useState('Add PDFs to merge documents or extract selected pages.')

  const addFiles = async (incoming: FileList | File[]) => {
    const accepted = Array.from(incoming).filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')).slice(0, Math.max(0, MAX_FILES - files.length))
    if (!accepted.length) {
      setStatus(`Choose PDF files. You can add up to ${MAX_FILES}.`)
      return
    }
    setStatus('Reading PDF page counts...')
    try {
      const { PDFDocument } = await import('pdf-lib')
      const loaded: PdfItem[] = []
      for (const file of accepted) {
        const document = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true })
        loaded.push({ id: crypto.randomUUID(), file, pages: document.getPageCount() })
      }
      setFiles((current) => [...current, ...loaded])
      setExtractSource((current) => current || loaded[0]?.id || '')
      setPageSelection('1')
      trackEvent('file_selected', { tool: 'pdf-merger-extractor', file_type: 'application/pdf', file_count: loaded.length })
      setStatus(`${loaded.length} PDF${loaded.length === 1 ? '' : 's'} added.`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'One of those PDFs could not be opened.')
    }
  }

  const moveFile = (index: number, direction: -1 | 1) => {
    setFiles((current) => {
      const target = index + direction
      if (target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const handleProcess = async () => {
    if (!files.length) return
    setStatus(mode === 'merge' ? 'Merging PDFs...' : 'Extracting pages...')
    try {
      const { PDFDocument } = await import('pdf-lib')
      const output = await PDFDocument.create()
      if (mode === 'merge') {
        for (const item of files) {
          const source = await PDFDocument.load(await item.file.arrayBuffer(), { ignoreEncryption: true })
          const pages = await output.copyPages(source, source.getPageIndices())
          pages.forEach((page) => output.addPage(page))
        }
      } else {
        const item = files.find((candidate) => candidate.id === extractSource) ?? files[0]
        const source = await PDFDocument.load(await item.file.arrayBuffer(), { ignoreEncryption: true })
        const indexes = parsePageSelection(pageSelection, item.pages)
        const pages = await output.copyPages(source, indexes)
        pages.forEach((page) => output.addPage(page))
      }
      const blob = pdfBlob(await output.save({ useObjectStreams: true }))
      const suffix = mode === 'merge' ? 'merged' : 'extracted'
      downloadBlobFile(blob, `${safeFileStem(filename)}_${suffix}.pdf`)
      const pageCount = output.getPageCount()
      setStatus(`${pageCount} page${pageCount === 1 ? '' : 's'} downloaded · ${formatBytes(blob.size)}.`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'The PDF could not be created.')
    }
  }

  const selectedSource = files.find((item) => item.id === extractSource) ?? files[0]

  return <div className="simple-tool">
    <aside className="tool-drawer">
      <div className="tool-drawer__heading"><img alt="Penguino merging PDF documents" className="tool-drawer__art" src="/assets/penguino-pdf-merge.webp" /><div><p>PDF</p><h1>PDF merger &amp; extractor</h1></div></div>
      <div className="drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void addFiles(event.dataTransfer.files) }}><input ref={inputRef} accept="application/pdf" className="visually-hidden" multiple onChange={(event) => { if (event.target.files) void addFiles(event.target.files); event.target.value = '' }} type="file" /><span className="drop-zone__icon"><Icon name="upload" /></span><strong>Drop PDFs here</strong><p>Up to {MAX_FILES} files · processed locally</p><button className="secondary-button" disabled={files.length >= MAX_FILES} onClick={() => inputRef.current?.click()} type="button">{files.length >= MAX_FILES ? '10 file limit reached' : 'Choose PDFs'}</button></div>
      <section className="drawer-section"><h2>Task</h2><div className="resize-mode-options" role="group" aria-label="PDF task"><button className={mode === 'merge' ? 'resize-mode resize-mode--active' : 'resize-mode'} onClick={() => setMode('merge')} type="button"><strong>Merge</strong><span>Combine files</span></button><button className={mode === 'extract' ? 'resize-mode resize-mode--active' : 'resize-mode'} onClick={() => setMode('extract')} type="button"><strong>Extract</strong><span>Choose pages</span></button></div>{mode === 'extract' && files.length ? <><label className="field"><span>Source PDF</span><select value={selectedSource?.id} onChange={(event) => { setExtractSource(event.target.value); setPageSelection('1') }}>{files.map((item) => <option key={item.id} value={item.id}>{item.file.name} · {item.pages} pages</option>)}</select></label><label className="field"><span>Pages <small>e.g. 1-3, 5, 8</small></span><input value={pageSelection} onChange={(event) => setPageSelection(event.target.value)} /></label></> : null}<label className="field"><span>Output filename</span><input value={filename} onChange={(event) => setFilename(event.target.value)} /></label></section>
      <button className="penguino-action" disabled={!files.length || (mode === 'extract' && !pageSelection.trim())} onClick={() => void handleProcess()} type="button"><Icon name="download" /> {mode === 'merge' ? 'Merge and download' : 'Extract and download'}</button><p aria-live="polite" className="tool-status">{status}</p>
    </aside>
    <section className="work-canvas"><div className="work-canvas__header"><div><p>PDF queue</p><h2>{files.length ? `${files.length} document${files.length === 1 ? '' : 's'} ready` : 'Your PDFs will appear here'}</h2></div>{files.length ? <button className="ghost-button" onClick={() => { setFiles([]); setExtractSource('') }} type="button">Clear all</button> : null}</div><div className="pdf-merge-stage">{files.length ? <div className="pdf-merge-list">{files.map((item, index) => <div className="pdf-merge-file" key={item.id}><span><Icon name="pdf" /></span><div><strong>{item.file.name}</strong><p>{item.pages} pages · {formatBytes(item.file.size)}</p></div><div><button aria-label={`Move ${item.file.name} up`} disabled={index === 0 || mode === 'extract'} onClick={() => moveFile(index, -1)} type="button">↑</button><button aria-label={`Move ${item.file.name} down`} disabled={index === files.length - 1 || mode === 'extract'} onClick={() => moveFile(index, 1)} type="button">↓</button><button aria-label={`Remove ${item.file.name}`} onClick={() => setFiles((current) => current.filter((candidate) => candidate.id !== item.id))} type="button">×</button></div></div>)}</div> : <div className="empty-canvas"><span><Icon name="merge" /></span><h3>Add one or more PDFs</h3><p>Combine complete documents or extract selected pages.</p></div>}</div></section>
  </div>
}

export default PdfMergeExtractTool
