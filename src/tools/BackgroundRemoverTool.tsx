import { useEffect, useState } from 'react'
import DropZone from '../components/DropZone'
import Icon from '../components/Icon'
import { downloadImageBlob, formatBytes, loadImageFile } from '../utils/imageFiles'

const canvasToPng = (canvas: HTMLCanvasElement) => new Promise<Blob>((resolve, reject) => {
  canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not create the transparent PNG.')), 'image/png')
})

const BackgroundRemoverTool = () => {
  const [file, setFile] = useState<File | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [originalUrl, setOriginalUrl] = useState('')
  const [resultUrl, setResultUrl] = useState('')
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [tolerance, setTolerance] = useState(36)
  const [softness, setSoftness] = useState(18)
  const [comparison, setComparison] = useState(50)
  const [backgroundColour, setBackgroundColour] = useState('#ffffff')
  const [status, setStatus] = useState('Choose an image with a solid or simple background.')

  useEffect(() => () => { if (originalUrl) URL.revokeObjectURL(originalUrl) }, [originalUrl])
  useEffect(() => () => { if (resultUrl) URL.revokeObjectURL(resultUrl) }, [resultUrl])

  useEffect(() => {
    if (!image) return
    let cancelled = false
    const timer = window.setTimeout(async () => {
      setStatus('Removing connected background...')
      try {
        const canvas = document.createElement('canvas')
        canvas.width = image.naturalWidth
        canvas.height = image.naturalHeight
        const context = canvas.getContext('2d', { willReadFrequently: true })
        if (!context) throw new Error('Image processing is unavailable in this browser.')
        context.drawImage(image, 0, 0)
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
        const { data, width, height } = pixels
        const corners = [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]]
        const background = corners.reduce((total, [x, y]) => {
          const offset = (y * width + x) * 4
          return [total[0] + data[offset], total[1] + data[offset + 1], total[2] + data[offset + 2]]
        }, [0, 0, 0]).map((value) => Math.round(value / corners.length))
        setBackgroundColour(`#${background.map((value) => value.toString(16).padStart(2, '0')).join('')}`)

        const maximumDistance = tolerance + softness
        const visited = new Uint8Array(width * height)
        const queue = new Int32Array(width * height)
        let head = 0
        let tail = 0
        const distanceAt = (position: number) => {
          const offset = position * 4
          return Math.hypot(data[offset] - background[0], data[offset + 1] - background[1], data[offset + 2] - background[2])
        }
        const add = (position: number) => {
          if (!visited[position] && distanceAt(position) <= maximumDistance) {
            visited[position] = 1
            queue[tail++] = position
          }
        }
        for (let x = 0; x < width; x += 1) { add(x); add((height - 1) * width + x) }
        for (let y = 0; y < height; y += 1) { add(y * width); add(y * width + width - 1) }
        while (head < tail) {
          const position = queue[head++]
          const x = position % width
          const y = Math.floor(position / width)
          const distance = distanceAt(position)
          const alphaScale = distance <= tolerance ? 0 : Math.min(1, (distance - tolerance) / Math.max(1, softness))
          data[position * 4 + 3] = Math.round(data[position * 4 + 3] * alphaScale)
          if (x > 0) add(position - 1)
          if (x < width - 1) add(position + 1)
          if (y > 0) add(position - width)
          if (y < height - 1) add(position + width)
        }
        context.putImageData(pixels, 0, 0)
        const blob = await canvasToPng(canvas)
        if (cancelled) return
        const nextUrl = URL.createObjectURL(blob)
        setResultBlob(blob)
        setResultUrl((current) => { if (current) URL.revokeObjectURL(current); return nextUrl })
        setStatus('Background removed. Adjust the controls if the edges need refining.')
      } catch (error) {
        if (!cancelled) setStatus(error instanceof Error ? error.message : 'Background removal failed.')
      }
    }, 220)
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [image, softness, tolerance])

  const handleFile = async (nextFile: File) => {
    try {
      const loaded = await loadImageFile(nextFile)
      setFile(nextFile)
      setImage(loaded.image)
      setOriginalUrl((current) => { if (current) URL.revokeObjectURL(current); return loaded.url })
      setResultBlob(null)
      setComparison(50)
      setStatus(`${loaded.image.naturalWidth} × ${loaded.image.naturalHeight}px · analysing edges...`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not open that image.')
    }
  }

  return (
    <div className="simple-tool background-remover-tool">
      <aside className="tool-drawer">
        <div className="tool-drawer__heading"><img alt="Penguino removing an image background" className="tool-drawer__art" src="/assets/penguino-background-remover.webp" /><div><p>Remove</p><h1>Background remover</h1></div></div>
        <DropZone accept="image/png,image/jpeg,image/webp" file={file} helpText="Best with solid or simple backgrounds" onFile={(next) => void handleFile(next)} />
        <section className="drawer-section"><div className="drawer-section__title"><h2>Background</h2><span className="detected-colour"><i style={{ background: backgroundColour }} />Detected</span></div><label className="field"><span>Removal tolerance {tolerance}</span><input max="120" min="5" step="1" type="range" value={tolerance} onChange={(event) => setTolerance(Number(event.target.value))} /></label><label className="field"><span>Edge softness {softness}</span><input max="60" min="0" step="1" type="range" value={softness} onChange={(event) => setSoftness(Number(event.target.value))} /></label><p className="tool-status tool-status--left">Increase tolerance to remove more. Reduce it if parts of the subject disappear.</p></section>
        {file && resultBlob ? <section className="background-result-summary"><span>Transparent PNG</span><strong>{formatBytes(resultBlob.size)}</strong></section> : null}
        <button className="penguino-action" disabled={!file || !resultBlob} onClick={() => { if (file && resultBlob) downloadImageBlob(resultBlob, file.name, 'background_removed', 'png') }} type="button"><Icon name="download" /> Download transparent PNG</button>
        <p className="tool-status">{status}</p>
      </aside>
      <section className="work-canvas">
        <div className="work-canvas__header"><div><p>Before &amp; after</p><h2>{file?.name ?? 'Your image will appear here'}</h2></div>{image ? <span>{image.naturalWidth} × {image.naturalHeight}px</span> : null}</div>
        <div className="optimiser-stage">
          {originalUrl && resultUrl ? <div className="comparison-wrap"><div className="comparison-image comparison-image--checker" style={{ aspectRatio: `${image?.naturalWidth ?? 1} / ${image?.naturalHeight ?? 1}` }}><div className="comparison-image__before" style={{ clipPath: `inset(0 ${100 - comparison}% 0 0)` }}><img alt="Original image" src={originalUrl} /></div><div className="comparison-image__after" style={{ clipPath: `inset(0 0 0 ${comparison}%)` }}><img alt="Image with its background removed" src={resultUrl} /></div><span className="comparison-label comparison-label--before">Before</span><span className="comparison-label comparison-label--after">Transparent</span><span className="comparison-divider" style={{ left: `${comparison}%` }}><i><Icon name="resize" /></i></span><input aria-label="Move before and after comparison" className="comparison-range" max="100" min="0" type="range" value={comparison} onChange={(event) => setComparison(Number(event.target.value))} /></div><p>Drag across the image to inspect the transparent result.</p></div> : <div className="empty-canvas"><span><Icon name="image" /></span><h3>Choose an image</h3><p>Remove a connected solid background and export a transparent PNG.</p></div>}
        </div>
      </section>
    </div>
  )
}

export default BackgroundRemoverTool
