import { useEffect, useState } from 'react'
import DropZone from '../components/DropZone'
import Icon from '../components/Icon'
import { downloadBlobFile, safeFileStem } from '../utils/downloads'
import { formatBytes, loadImageFile } from '../utils/imageFiles'

const FAVICON_SIZES = [16, 32, 48, 180, 192, 512] as const

const FaviconGeneratorTool = () => {
  const [file, setFile] = useState<File | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [background, setBackground] = useState('#ffffff')
  const [padding, setPadding] = useState(8)
  const [status, setStatus] = useState('Choose a square image for the cleanest result.')

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  const handleFile = async (nextFile: File) => {
    try {
      const loaded = await loadImageFile(nextFile)
      setFile(nextFile)
      setImage(loaded.image)
      setPreviewUrl((current) => { if (current) URL.revokeObjectURL(current); return loaded.url })
      setStatus(`${loaded.image.naturalWidth} × ${loaded.image.naturalHeight}px · ready to generate`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not open that image.')
    }
  }

  const renderIcon = async (size: number) => {
    if (!image) throw new Error('Choose an image first.')
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas is unavailable.')
    context.fillStyle = background
    context.fillRect(0, 0, size, size)
    const inset = size * (padding / 100)
    const available = size - inset * 2
    const scale = Math.min(available / image.naturalWidth, available / image.naturalHeight)
    const width = image.naturalWidth * scale
    const height = image.naturalHeight * scale
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height)
    return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not create icon.')), 'image/png'))
  }

  const handleDownload = async () => {
    if (!file || !image) return
    setStatus('Building favicon package...')
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      const names: Record<number, string> = {
        16: 'favicon-16x16.png', 32: 'favicon-32x32.png', 48: 'favicon-48x48.png',
        180: 'apple-touch-icon.png', 192: 'android-chrome-192x192.png', 512: 'android-chrome-512x512.png'
      }
      const blobs = await Promise.all(FAVICON_SIZES.map(async (size) => ({ size, blob: await renderIcon(size) })))
      blobs.forEach(({ size, blob }) => zip.file(names[size], blob))
      zip.file('site.webmanifest', JSON.stringify({ name: '', short_name: '', icons: [
        { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
      ], theme_color: background, background_color: background, display: 'standalone' }, null, 2))
      zip.file('favicon-markup.html', '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\n<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">\n<link rel="manifest" href="/site.webmanifest">\n')
      const output = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
      downloadBlobFile(output, `${safeFileStem(file.name)}_favicons.zip`)
      setStatus(`Downloaded ${formatBytes(output.size)} favicon package.`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Favicon generation failed.')
    }
  }

  return (
    <div className="simple-tool">
      <aside className="tool-drawer">
        <div className="tool-drawer__heading"><span className="tool-icon tool-icon--orange"><Icon name="favicon" /></span><div><p>Create</p><h1>Favicon generator</h1></div></div>
        <DropZone accept="image/png,image/jpeg,image/webp" file={file} helpText="PNG, JPEG or WebP · square recommended" onFile={(next) => void handleFile(next)} />
        <section className="drawer-section"><h2>Appearance</h2><label className="field"><span>Background</span><div className="color-input"><input type="color" value={background} onChange={(event) => setBackground(event.target.value)} /><input type="text" value={background} onChange={(event) => setBackground(event.target.value)} /></div></label><label className="field"><span>Padding {padding}%</span><input max="30" min="0" type="range" value={padding} onChange={(event) => setPadding(Number(event.target.value))} /></label></section>
        <section className="drawer-section"><h2>Package contents</h2><div className="favicon-size-list">{FAVICON_SIZES.map((size) => <span key={size}>{size}×{size}</span>)}</div><p className="tool-status tool-status--left">Includes Apple Touch, Android icons, web manifest and HTML markup.</p></section>
        <button className="penguino-action" disabled={!image} onClick={() => void handleDownload()} type="button"><Icon name="download" /> Download favicon ZIP</button>
        <p className="tool-status">{status}</p>
      </aside>
      <section className="work-canvas"><div className="work-canvas__header"><div><p>Preview</p><h2>Browser and device icons</h2></div>{file ? <span>{file.name}</span> : null}</div><div className="favicon-preview-stage">{previewUrl ? <div className="favicon-preview-grid">{[16, 32, 64, 180].map((size) => <div key={size}><span style={{ backgroundColor: background, padding: `${Math.max(1, size * padding / 100)}px`, width: size, height: size }}><img alt="" src={previewUrl} /></span><small>{size}px</small></div>)}</div> : <div className="empty-canvas"><span><Icon name="favicon" /></span><h3>Add your logo</h3><p>Preview favicon sizes before downloading the package.</p></div>}</div></section>
    </div>
  )
}

export default FaviconGeneratorTool
