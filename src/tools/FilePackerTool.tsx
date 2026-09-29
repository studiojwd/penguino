import { useRef, useState } from 'react'
import Icon from '../components/Icon'
import { downloadBlobFile, safeFileStem } from '../utils/downloads'
import { formatBytes } from '../utils/imageFiles'
import { trackFilesSelected, trackProcessingFailed } from '../utils/analytics'

const MAX_FILES = 50
const MAX_TOTAL_SIZE = 500 * 1024 * 1024

const FilePackerTool = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [archiveName, setArchiveName] = useState('penguino_files')
  const [prefix, setPrefix] = useState('')
  const [status, setStatus] = useState('Add files to create one tidy ZIP archive.')

  const addFiles = (incoming: FileList | File[]) => {
    const candidates = Array.from(incoming)
    trackFilesSelected(candidates, { tool: 'file-packer' })
    setFiles((current) => {
      const existing = new Set(current.map((file) => `${file.name}-${file.size}-${file.lastModified}`))
      const unique = candidates.filter((file) => !existing.has(`${file.name}-${file.size}-${file.lastModified}`))
      const next: File[] = [...current]
      let totalSize = current.reduce((sum, file) => sum + file.size, 0)
      for (const file of unique) {
        if (next.length >= MAX_FILES || totalSize + file.size > MAX_TOTAL_SIZE) break
        next.push(file)
        totalSize += file.size
      }
      const omitted = next.length < current.length + unique.length
      setStatus(omitted ? `Some files were skipped. The limit is ${MAX_FILES} files or 500 MB.` : `${next.length} file${next.length === 1 ? '' : 's'} ready to pack.`)
      return next
    })
  }

  const handlePack = async () => {
    if (!files.length) return
    setStatus('Packing files...')
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      const cleanPrefix = prefix.trim() ? `${safeFileStem(prefix)}_` : ''
      const usedNames = new Set<string>()
      files.forEach((file, index) => {
        let name = `${cleanPrefix}${file.name}`
        if (usedNames.has(name)) name = `${cleanPrefix}${index + 1}_${file.name}`
        usedNames.add(name)
        zip.file(name, file)
      })
      const output = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
      downloadBlobFile(output, `${safeFileStem(archiveName)}.zip`, { input_size_bytes: files.reduce((sum, file) => sum + file.size, 0), operation: 'pack_files', file_count: files.length })
      setStatus(`Downloaded ${formatBytes(output.size)} ZIP containing ${files.length} files.`)
    } catch (error) {
      trackProcessingFailed('file-packer', 'pack_files', error)
      setStatus(error instanceof Error ? error.message : 'The ZIP could not be created.')
    }
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0)

  return (
    <div className="simple-tool">
      <aside className="tool-drawer">
        <div className="tool-drawer__heading"><span aria-label="Penguino packing files" className="tool-drawer__art tool-drawer__art--quad-sprite tool-drawer__art--packer" role="img" /><div><p>Bundle</p><h1>File packer</h1></div></div>
        <div className="drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files) }}><input ref={inputRef} className="visually-hidden" multiple onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.target.value = '' }} type="file" /><span className="drop-zone__icon"><Icon name="upload" /></span><strong>Drop files here</strong><p>Any file type · up to {MAX_FILES} files or 500 MB</p><button className="secondary-button" disabled={files.length >= MAX_FILES} onClick={() => inputRef.current?.click()} type="button">{files.length >= MAX_FILES ? '50 file limit reached' : 'Choose files'}</button></div>
        <section className="drawer-section"><h2>Archive details</h2><label className="field"><span>ZIP name</span><input value={archiveName} onChange={(event) => setArchiveName(event.target.value)} /></label><label className="field"><span>Filename prefix <small>Optional</small></span><input placeholder="e.g. project" value={prefix} onChange={(event) => setPrefix(event.target.value)} /></label></section>
        <button className="penguino-action" disabled={!files.length} onClick={() => void handlePack()} type="button"><Icon name="archive" /> Create and download ZIP</button><p aria-live="polite" className="tool-status">{status}</p>
      </aside>
      <section className="work-canvas"><div className="work-canvas__header"><div><p>Package</p><h2>{files.length ? `${files.length} file${files.length === 1 ? '' : 's'} ready` : 'Your files will appear here'}</h2></div>{files.length ? <div className="work-canvas__actions"><span>{formatBytes(totalSize)}</span><button className="ghost-button" onClick={() => { setFiles([]); setStatus('Add files to create one tidy ZIP archive.') }} type="button">Clear all</button></div> : null}</div><div className="bulk-stage">{files.length ? <div className="bulk-file-list">{files.map((file, index) => <div className="bulk-file" key={`${file.name}-${file.lastModified}-${index}`}><span><Icon name="document" /></span><div><strong>{file.name}</strong><p>{formatBytes(file.size)}</p></div><button aria-label={`Remove ${file.name}`} onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))} type="button">×</button></div>)}</div> : <div className="empty-canvas"><span><Icon name="archive" /></span><h3>Make one tidy download</h3><p>Bundle documents, images and other files into a ZIP.</p></div>}</div></section>
    </div>
  )
}

export default FilePackerTool
