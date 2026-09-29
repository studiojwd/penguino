import { useEffect, useState } from 'react'
import DropZone from '../components/DropZone'
import Icon from '../components/Icon'
import { qualityBucket, trackProcessingFailed } from '../utils/analytics'
import { canvasToBlob, drawImageFit, type ImageFit } from '../utils/canvas'
import { downloadImageBlob, loadImageFile, type RasterFormat } from '../utils/imageFiles'

const PRESETS = [
  { id: 'instagram-square', label: 'Instagram square', width: 1080, height: 1080 },
  { id: 'instagram-portrait', label: 'Instagram portrait', width: 1080, height: 1350 },
  { id: 'instagram-story', label: 'Story / Reel', width: 1080, height: 1920 },
  { id: 'facebook-post', label: 'Facebook post', width: 1200, height: 630 },
  { id: 'x-post', label: 'X post', width: 1920, height: 1080 },
  { id: 'linkedin-post', label: 'LinkedIn post', width: 1200, height: 628 },
  { id: 'youtube-thumbnail', label: 'YouTube thumbnail', width: 3840, height: 2160 },
  { id: 'pinterest-pin', label: 'Pinterest pin', width: 1000, height: 1500 }
] as const

const SocialMediaResizerTool = () => {
  const [file, setFile] = useState<File | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [presetId, setPresetId] = useState<(typeof PRESETS)[number]['id']>('instagram-square')
  const [fit, setFit] = useState<ImageFit>('cover')
  const [background, setBackground] = useState('#ffffff')
  const [format, setFormat] = useState<RasterFormat>('webp')
  const [quality, setQuality] = useState(0.88)
  const [status, setStatus] = useState('Choose an image and social media size.')
  const preset = PRESETS.find((item) => item.id === presetId) ?? PRESETS[0]

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  const handleFile = async (nextFile: File) => {
    try {
      const loaded = await loadImageFile(nextFile)
      setFile(nextFile)
      setImage(loaded.image)
      setPreviewUrl((current) => { if (current) URL.revokeObjectURL(current); return loaded.url })
      setStatus(`${loaded.image.naturalWidth} × ${loaded.image.naturalHeight}px source ready.`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not open that image.')
    }
  }

  const handleDownload = async () => {
    if (!image || !file) return
    setStatus('Preparing social image...')
    try {
      const canvas = document.createElement('canvas')
      canvas.width = preset.width
      canvas.height = preset.height
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas is unavailable in this browser.')
      drawImageFit(context, image, preset.width, preset.height, fit, background)
      const blob = await canvasToBlob(canvas, format, quality)
      downloadImageBlob(blob, file.name, preset.id, format, '', { input_size_bytes: file.size, operation: 'social_resize', preset: preset.id, fit, quality_band: qualityBucket(quality) })
      setStatus(`${preset.label} downloaded at ${preset.width} × ${preset.height}px.`)
    } catch (error) {
      trackProcessingFailed('social-media-resizer', 'social_resize', error)
      setStatus(error instanceof Error ? error.message : 'The social image could not be created.')
    }
  }

  return <div className="simple-tool">
    <aside className="tool-drawer">
      <div className="tool-drawer__heading"><img alt="Penguino resizing an image for social media" className="tool-drawer__art" src="/assets/penguino-social-resizer.webp" /><div><p>Social</p><h1>Social media resizer</h1></div></div>
      <DropZone accept="image/png,image/jpeg,image/webp" file={file} helpText="PNG, JPEG or WebP" onFile={(next) => void handleFile(next)} />
      <section className="drawer-section"><h2>Platform size</h2><label className="field"><span>Preset</span><select onChange={(event) => setPresetId(event.target.value as typeof presetId)} value={presetId}>{PRESETS.map((item) => <option key={item.id} value={item.id}>{item.label} · {item.width} × {item.height}</option>)}</select></label><div className="resize-mode-options" role="group" aria-label="Image fit"><button className={fit === 'cover' ? 'resize-mode resize-mode--active' : 'resize-mode'} onClick={() => setFit('cover')} type="button"><strong>Fill</strong><span>Crop edges</span></button><button className={fit === 'contain' ? 'resize-mode resize-mode--active' : 'resize-mode'} onClick={() => setFit('contain')} type="button"><strong>Fit</strong><span>Show full image</span></button></div>{fit === 'contain' ? <label className="field"><span>Background</span><span className="color-input"><input aria-label="Background colour" type="color" value={background} onChange={(event) => setBackground(event.target.value)} /><input value={background} onChange={(event) => setBackground(event.target.value)} /></span></label> : null}</section>
      <section className="drawer-section"><h2>Export</h2><label className="field"><span>Format</span><select onChange={(event) => setFormat(event.target.value as RasterFormat)} value={format}><option value="webp">WebP</option><option value="jpeg">JPEG</option><option value="png">PNG</option></select></label>{format !== 'png' ? <label className="field"><span>Quality {Math.round(quality * 100)}%</span><input max="1" min="0.3" step="0.01" type="range" value={quality} onChange={(event) => setQuality(Number(event.target.value))} /></label> : null}</section>
      <button className="penguino-action" disabled={!image} onClick={() => void handleDownload()} type="button"><Icon name="download" /> Download social image</button><p aria-live="polite" className="tool-status">{status}</p>
    </aside>
    <section className="work-canvas"><div className="work-canvas__header"><div><p>Preview</p><h2>{preset.label}</h2></div><span>{preset.width} × {preset.height}px</span></div><div className="social-stage">{previewUrl ? <div className="social-preview" style={{ aspectRatio: `${preset.width} / ${preset.height}`, backgroundColor: background }}><img alt={`${preset.label} preview`} src={previewUrl} style={{ objectFit: fit }} /></div> : <div className="empty-canvas"><span><Icon name="resize" /></span><h3>Choose an image</h3><p>Preview it in popular social media dimensions.</p></div>}</div></section>
  </div>
}

export default SocialMediaResizerTool
