import { useEffect, useState } from 'react'
import DropZone from '../components/DropZone'
import Icon from '../components/Icon'
import { downloadBlobFile, safeFileStem } from '../utils/downloads'
import { formatBytes, imageToBlob, loadImageFile, type RasterFormat } from '../utils/imageFiles'

const formatFromFile = (file: File): RasterFormat => {
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpeg'
}

interface MetadataEntry {
  key: string
  label: string
  value: string
}

const METADATA_FIELDS: Array<[string, string]> = [
  ['Make', 'Camera maker'], ['Model', 'Camera model'], ['LensModel', 'Lens'], ['Software', 'Software'],
  ['DateTimeOriginal', 'Date taken'], ['CreateDate', 'Created'], ['ModifyDate', 'Modified'],
  ['Artist', 'Creator'], ['Copyright', 'Copyright'], ['ImageDescription', 'Description'], ['UserComment', 'Comment'],
  ['latitude', 'Latitude'], ['longitude', 'Longitude'], ['GPSLatitude', 'GPS latitude'], ['GPSLongitude', 'GPS longitude'],
  ['ExposureTime', 'Exposure'], ['FNumber', 'Aperture'], ['ISO', 'ISO'], ['FocalLength', 'Focal length'],
  ['Flash', 'Flash'], ['WhiteBalance', 'White balance'], ['Orientation', 'Orientation'], ['ColorSpace', 'Colour space']
]

const displayValue = (value: unknown) => {
  if (value instanceof Date) return value.toLocaleString()
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object' && value !== null) return JSON.stringify(value)
  return String(value)
}

const readableMetadata = (metadata: Record<string, unknown> | undefined): MetadataEntry[] => {
  if (!metadata) return []
  return METADATA_FIELDS.flatMap(([key, label]) => {
    const value = metadata[key]
    if (value === undefined || value === null || value === '') return []
    return [{ key, label, value: displayValue(value) }]
  })
}

const MetadataRemoverTool = () => {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [cleaned, setCleaned] = useState<Blob | null>(null)
  const [format, setFormat] = useState<RasterFormat>('jpeg')
  const [quality, setQuality] = useState(0.92)
  const [metadata, setMetadata] = useState<MetadataEntry[]>([])
  const [inspecting, setInspecting] = useState(false)
  const [status, setStatus] = useState('Choose an image to remove its embedded metadata.')

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  const handleFile = async (nextFile: File) => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(nextFile.type)) {
      setStatus('Please choose a PNG, JPEG or WebP image.')
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const nextFormat = formatFromFile(nextFile)
    setFile(nextFile)
    setFormat(nextFormat)
    setCleaned(null)
    setMetadata([])
    setPreviewUrl(URL.createObjectURL(nextFile))
    setInspecting(true)
    setStatus('Inspecting embedded metadata...')
    try {
      const { parse } = await import('exifr')
      const parsed = await parse(nextFile, true) as Record<string, unknown> | undefined
      const entries = readableMetadata(parsed)
      setMetadata(entries)
      setStatus(entries.length ? `${entries.length} metadata field${entries.length === 1 ? '' : 's'} found.` : 'No readable personal or descriptive metadata was found.')
    } catch {
      setStatus('The image is ready, but its metadata could not be inspected.')
    } finally {
      setInspecting(false)
    }
  }

  const handleClean = async () => {
    if (!file) return
    setStatus('Removing metadata...')
    try {
      const { image, url } = await loadImageFile(file)
      try {
        const blob = await imageToBlob(image, image.naturalWidth, image.naturalHeight, format, quality)
        const { parse } = await import('exifr')
        const remaining = readableMetadata(await parse(blob, true) as Record<string, unknown> | undefined)
        setCleaned(blob)
        setStatus(remaining.length ? `Clean copy ready · ${formatBytes(blob.size)}. ${remaining.length} standard field${remaining.length === 1 ? '' : 's'} remain.` : `Verified clean copy · ${formatBytes(blob.size)}`)
      } finally {
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'The image could not be cleaned.')
    }
  }

  const handleDownload = () => {
    if (!file || !cleaned) return
    const extension = format === 'jpeg' ? 'jpg' : format
    downloadBlobFile(cleaned, `${safeFileStem(file.name)}_clean.${extension}`)
  }

  return (
    <div className="simple-tool">
      <aside className="tool-drawer">
        <div className="tool-drawer__heading"><span aria-label="Penguino removing file metadata" className="tool-drawer__art tool-drawer__art--quad-sprite tool-drawer__art--metadata" role="img" /><div><p>Privacy</p><h1>Metadata remover</h1></div></div>
        <DropZone accept="image/png,image/jpeg,image/webp" file={file} helpText="PNG, JPEG or WebP" onFile={(next) => void handleFile(next)} />
        {file ? <section className={`drawer-section metadata-inspection ${cleaned ? 'metadata-inspection--removed' : ''}`}><div className="drawer-section__title"><h2>{cleaned ? 'Metadata removed' : 'Metadata found'}</h2>{inspecting ? <span>Checking...</span> : <span>{metadata.length} fields</span>}</div>{inspecting ? <p className="metadata-empty">Reading EXIF, GPS, IPTC and XMP data...</p> : metadata.length ? <dl>{metadata.map((entry) => <div key={entry.key}><dt>{entry.label}</dt><dd>{entry.value}</dd></div>)}</dl> : <p className="metadata-empty">No readable personal or descriptive metadata detected.</p>}</section> : null}
        <section className="drawer-section"><h2>Clean copy</h2><label className="field"><span>Format</span><select value={format} onChange={(event) => { setFormat(event.target.value as RasterFormat); setCleaned(null) }}><option value="jpeg">JPEG</option><option value="png">PNG</option><option value="webp">WebP</option></select></label>{format !== 'png' ? <label className="field"><span>Quality {Math.round(quality * 100)}%</span><input max="1" min="0.5" step="0.01" type="range" value={quality} onChange={(event) => { setQuality(Number(event.target.value)); setCleaned(null) }} /></label> : null}<p className="tool-status tool-status--left">Re-exports pixels only, removing EXIF, location, camera and other embedded metadata.</p></section>
        {cleaned ? <button className="penguino-action" onClick={handleDownload} type="button"><Icon name="download" /> Download clean image</button> : <button className="penguino-action" disabled={!file} onClick={() => void handleClean()} type="button"><Icon name="shield" /> Remove metadata</button>}
        <p className="tool-status">{status}</p>
      </aside>
      <section className="work-canvas"><div className="work-canvas__header"><div><p>Preview</p><h2>{file?.name ?? 'Your image will appear here'}</h2></div>{file ? <span>{formatBytes(file.size)} original</span> : null}</div><div className="image-stage">{previewUrl ? <img alt="Metadata removal preview" src={previewUrl} /> : <div className="empty-canvas"><span><Icon name="shield" /></span><h3>Protect your privacy</h3><p>Create a visually identical copy without hidden image data.</p></div>}</div></section>
    </div>
  )
}

export default MetadataRemoverTool
