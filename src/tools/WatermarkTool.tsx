import { useEffect, useState } from 'react'
import DropZone from '../components/DropZone'
import Icon from '../components/Icon'
import { qualityBucket, trackProcessingFailed } from '../utils/analytics'
import { canvasToBlob } from '../utils/canvas'
import { downloadImageBlob, loadImageFile, type RasterFormat } from '../utils/imageFiles'

type WatermarkPosition = 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right'

const positionWatermark = (context: CanvasRenderingContext2D, text: string, width: number, height: number, position: WatermarkPosition) => {
  const padding = Math.max(16, width * 0.04)
  const metrics = context.measureText(text)
  const textWidth = metrics.width
  const textHeight = (metrics.actualBoundingBoxAscent || width * 0.04) + (metrics.actualBoundingBoxDescent || 0)
  const horizontal = position.endsWith('right') ? width - padding - textWidth : position === 'center' ? (width - textWidth) / 2 : padding
  const vertical = position.startsWith('top') ? padding + textHeight : position === 'center' ? (height + textHeight) / 2 : height - padding
  context.fillText(text, horizontal, vertical)
}

const WatermarkTool = () => {
  const [file, setFile] = useState<File | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [text, setText] = useState('© StudioJWD')
  const [position, setPosition] = useState<WatermarkPosition>('bottom-right')
  const [opacity, setOpacity] = useState(0.55)
  const [size, setSize] = useState(5)
  const [colour, setColour] = useState('#ffffff')
  const [repeat, setRepeat] = useState(false)
  const [format, setFormat] = useState<RasterFormat>('webp')
  const [quality, setQuality] = useState(0.9)
  const [status, setStatus] = useState('Choose an image to add a text watermark.')

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  const handleFile = async (nextFile: File) => {
    try {
      const loaded = await loadImageFile(nextFile)
      setFile(nextFile)
      setImage(loaded.image)
      setPreviewUrl((current) => { if (current) URL.revokeObjectURL(current); return loaded.url })
      setStatus(`${loaded.image.naturalWidth} × ${loaded.image.naturalHeight}px ready.`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not open that image.')
    }
  }

  const drawWatermark = (context: CanvasRenderingContext2D, width: number, height: number) => {
    const fontSize = Math.max(14, Math.round(width * size / 100))
    context.save()
    context.globalAlpha = opacity
    context.fillStyle = colour
    context.font = `800 ${fontSize}px Manrope, sans-serif`
    context.shadowColor = 'rgba(0, 0, 0, 0.4)'
    context.shadowBlur = Math.max(2, fontSize * 0.08)
    if (repeat) {
      context.translate(width / 2, height / 2)
      context.rotate(-Math.PI / 7)
      const spacingX = Math.max(context.measureText(text).width + fontSize * 2, width / 3)
      const spacingY = fontSize * 3.2
      for (let y = -height; y <= height; y += spacingY) for (let x = -width; x <= width; x += spacingX) context.fillText(text, x, y)
    } else {
      positionWatermark(context, text, width, height, position)
    }
    context.restore()
  }

  const handleDownload = async () => {
    if (!image || !file || !text.trim()) return
    setStatus('Applying watermark...')
    try {
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas is unavailable in this browser.')
      if (format === 'jpeg') {
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, canvas.width, canvas.height)
      }
      context.drawImage(image, 0, 0)
      drawWatermark(context, canvas.width, canvas.height)
      const blob = await canvasToBlob(canvas, format, quality)
      downloadImageBlob(blob, file.name, 'watermarked', format, '', { input_size_bytes: file.size, operation: 'watermark', watermark_position: repeat ? 'repeated' : position, quality_band: qualityBucket(quality) })
      setStatus('Watermarked image downloaded.')
    } catch (error) {
      trackProcessingFailed('watermark-tool', 'watermark', error)
      setStatus(error instanceof Error ? error.message : 'The watermark could not be applied.')
    }
  }

  return <div className="simple-tool">
    <aside className="tool-drawer">
      <div className="tool-drawer__heading"><img alt="Penguino adding a watermark" className="tool-drawer__art" src="/assets/penguino-watermark.webp" /><div><p>Protect</p><h1>Watermark tool</h1></div></div>
      <DropZone accept="image/png,image/jpeg,image/webp" file={file} helpText="PNG, JPEG or WebP" onFile={(next) => void handleFile(next)} />
      <section className="drawer-section"><h2>Watermark</h2><label className="field"><span>Text</span><input value={text} onChange={(event) => setText(event.target.value)} /></label><label className="field"><span>Position</span><select disabled={repeat} value={position} onChange={(event) => setPosition(event.target.value as WatermarkPosition)}><option value="top-left">Top left</option><option value="top-right">Top right</option><option value="center">Centre</option><option value="bottom-left">Bottom left</option><option value="bottom-right">Bottom right</option></select></label><label className="toggle"><input checked={repeat} type="checkbox" onChange={(event) => setRepeat(event.target.checked)} /><span>Repeat across the image</span></label><label className="field"><span>Size {size}%</span><input max="14" min="2" type="range" value={size} onChange={(event) => setSize(Number(event.target.value))} /></label><label className="field"><span>Opacity {Math.round(opacity * 100)}%</span><input max="1" min="0.1" step="0.05" type="range" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} /></label><label className="field"><span>Colour</span><input type="color" value={colour} onChange={(event) => setColour(event.target.value)} /></label></section>
      <section className="drawer-section"><h2>Export</h2><label className="field"><span>Format</span><select value={format} onChange={(event) => setFormat(event.target.value as RasterFormat)}><option value="webp">WebP</option><option value="jpeg">JPEG</option><option value="png">PNG</option></select></label>{format !== 'png' ? <label className="field"><span>Quality {Math.round(quality * 100)}%</span><input max="1" min="0.3" step="0.01" type="range" value={quality} onChange={(event) => setQuality(Number(event.target.value))} /></label> : null}</section>
      <button className="penguino-action" disabled={!image || !text.trim()} onClick={() => void handleDownload()} type="button"><Icon name="download" /> Download watermarked image</button><p aria-live="polite" className="tool-status">{status}</p>
    </aside>
    <section className="work-canvas"><div className="work-canvas__header"><div><p>Live preview</p><h2>{file?.name ?? 'Your image will appear here'}</h2></div></div><div className="watermark-stage">{previewUrl ? <div className="watermark-preview"><img alt="Watermark preview" src={previewUrl} />{repeat ? <div aria-hidden="true" className="watermark-repeat" style={{ color: colour, opacity, fontSize: `${Math.max(12, size * 4)}px` }}>{Array.from({ length: 18 }, (_, index) => <span key={index}>{text}</span>)}</div> : <span className={`watermark-overlay watermark-overlay--${position}`} style={{ color: colour, opacity, fontSize: `${Math.max(12, size * 5)}px` }}>{text}</span>}</div> : <div className="empty-canvas"><span><Icon name="watermark" /></span><h3>Add an image</h3><p>Preview your watermark before exporting.</p></div>}</div></section>
  </div>
}

export default WatermarkTool
