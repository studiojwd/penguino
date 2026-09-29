import { useEffect, useRef, useState } from 'react'
import DropZone from '../components/DropZone'
import Icon from '../components/Icon'
import { qualityBucket, trackProcessingFailed } from '../utils/analytics'
import { downloadImageBlob, formatBytes, imageToBlob, loadImageFile, type RasterFormat } from '../utils/imageFiles'

const ImageOptimiserTool = () => {
  const [file, setFile] = useState<File | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [originalUrl, setOriginalUrl] = useState('')
  const [optimisedUrl, setOptimisedUrl] = useState('')
  const [optimisedBlob, setOptimisedBlob] = useState<Blob | null>(null)
  const [format, setFormat] = useState<RasterFormat>('webp')
  const [quality, setQuality] = useState(0.8)
  const [comparison, setComparison] = useState(50)
  const [zoom, setZoom] = useState<'fit' | 'actual'>('fit')
  const [status, setStatus] = useState('Choose an image to begin.')
  const comparisonScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl)
  }, [originalUrl])

  useEffect(() => () => {
    if (optimisedUrl) URL.revokeObjectURL(optimisedUrl)
  }, [optimisedUrl])

  useEffect(() => {
    if (zoom !== 'actual') return
    const frame = window.requestAnimationFrame(() => {
      const viewport = comparisonScrollRef.current
      if (!viewport) return
      viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2)
      viewport.scrollTop = Math.max(0, (viewport.scrollHeight - viewport.clientHeight) / 2)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [image, zoom])

  useEffect(() => {
    if (!image) return
    let cancelled = false
    const timer = window.setTimeout(async () => {
      setStatus('Optimising image...')
      try {
        const blob = await imageToBlob(image, image.naturalWidth, image.naturalHeight, format, quality)
        if (cancelled) return
        const nextUrl = URL.createObjectURL(blob)
        setOptimisedBlob(blob)
        setOptimisedUrl((current) => {
          if (current) URL.revokeObjectURL(current)
          return nextUrl
        })
        setStatus(blob.size < (file?.size ?? 0) ? 'Optimised and ready to download.' : 'Ready, but the original file is already smaller.')
      } catch (error) {
        trackProcessingFailed('image-optimiser', 'optimise', error)
        if (!cancelled) setStatus(error instanceof Error ? error.message : 'Image optimisation failed.')
      }
    }, 180)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [file?.size, format, image, quality])

  const handleFile = async (nextFile: File) => {
    try {
      const loaded = await loadImageFile(nextFile)
      setFile(nextFile)
      setImage(loaded.image)
      setOriginalUrl((current) => {
        if (current) URL.revokeObjectURL(current)
        return loaded.url
      })
      setOptimisedBlob(null)
      setComparison(50)
      setStatus(`${loaded.image.naturalWidth} × ${loaded.image.naturalHeight}px · optimising...`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not open that image.')
    }
  }

  const savedBytes = file && optimisedBlob ? file.size - optimisedBlob.size : 0
  const savedPercent = file && optimisedBlob && file.size ? Math.round((savedBytes / file.size) * 100) : 0

  return (
    <div className="simple-tool optimiser-tool">
      <aside className="tool-drawer">
        <div className="tool-drawer__heading"><img alt="Penguino compressing an image" className="tool-drawer__art tool-drawer__art--blend" src="/assets/penguino-optimise.webp" /><div><p>Optimise</p><h1>Image optimiser</h1></div></div>
        <DropZone accept="image/png,image/jpeg,image/webp" file={file} helpText="PNG, JPEG or WebP" onFile={(next) => void handleFile(next)} />
        <section className="drawer-section"><h2>Compression</h2><label className="field"><span>Output format</span><select value={format} onChange={(event) => setFormat(event.target.value as RasterFormat)}><option value="webp">WebP · recommended</option><option value="jpeg">JPEG</option><option value="png">PNG · lossless</option></select></label>{format !== 'png' ? <label className="field"><span>Quality {Math.round(quality * 100)}%</span><input max="0.98" min="0.2" step="0.01" type="range" value={quality} onChange={(event) => setQuality(Number(event.target.value))} /></label> : <p className="tool-status tool-status--left">PNG is lossless, so its file size may not reduce.</p>}</section>
        {file && optimisedBlob ? <section className="optimiser-savings" aria-label="File size comparison"><div><span>Original</span><strong>{formatBytes(file.size)}</strong></div><Icon name="arrow" /><div><span>Optimised</span><strong>{formatBytes(optimisedBlob.size)}</strong></div><p className={savedBytes > 0 ? 'optimiser-savings__good' : 'optimiser-savings__neutral'}>{savedBytes > 0 ? `${savedPercent}% smaller · ${formatBytes(savedBytes)} saved` : `${formatBytes(Math.abs(savedBytes))} larger than original`}</p></section> : null}
        <button className="penguino-action" disabled={!file || !optimisedBlob} onClick={() => { if (file && optimisedBlob) downloadImageBlob(optimisedBlob, file.name, 'optimised', format, '', { input_size_bytes: file.size, operation: 'optimise', quality_band: qualityBucket(quality) }) }} type="button"><Icon name="download" /> Download optimised image</button>
        <p className="tool-status">{status}</p>
      </aside>

      <section className="work-canvas">
        <div className="work-canvas__header"><div><p>Before &amp; after</p><h2>{file?.name ?? 'Your image will appear here'}</h2></div>{image ? <div className="work-canvas__actions"><span>{image.naturalWidth} × {image.naturalHeight}px</span><div className="zoom-switch" role="group" aria-label="Preview zoom"><button className={zoom === 'fit' ? 'zoom-switch__active' : ''} onClick={() => setZoom('fit')} type="button">Fit</button><button className={zoom === 'actual' ? 'zoom-switch__active' : ''} onClick={() => setZoom('actual')} type="button">100%</button></div></div> : null}</div>
        <div className="optimiser-stage">
          {originalUrl && optimisedUrl ? <div className="comparison-wrap">
            <div className={zoom === 'actual' ? 'comparison-scroll comparison-scroll--actual' : 'comparison-scroll'} ref={comparisonScrollRef}>
              <div className="comparison-image" style={{ aspectRatio: `${image?.naturalWidth ?? 1} / ${image?.naturalHeight ?? 1}`, ...(zoom === 'actual' && image ? { width: `${image.naturalWidth}px`, maxWidth: 'none', maxHeight: 'none' } : {}) }}>
                <img alt="Original image" src={originalUrl} />
                <div className="comparison-image__after" style={{ clipPath: `inset(0 0 0 ${comparison}%)` }}><img alt="Optimised image" src={optimisedUrl} /></div>
                <span className="comparison-label comparison-label--before">Before</span><span className="comparison-label comparison-label--after">After</span>
                <span className="comparison-divider" style={{ left: `${comparison}%` }}><i><Icon name="resize" /></i></span>
                <input aria-label="Move before and after comparison" className="comparison-range" max="100" min="0" type="range" value={comparison} onChange={(event) => setComparison(Number(event.target.value))} />
              </div>
            </div>
            <p>{zoom === 'actual' ? 'Viewing at 100%. Scroll to inspect fine detail and drag to compare.' : 'Drag across the image to compare the original and optimised versions.'}</p>
          </div> : <div className="empty-canvas"><span><Icon name="sparkles" /></span><h3>Choose an image</h3><p>Compare quality and file size before downloading.</p></div>}
        </div>
      </section>
    </div>
  )
}

export default ImageOptimiserTool
