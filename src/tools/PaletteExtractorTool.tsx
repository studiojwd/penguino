import { useEffect, useState } from 'react'
import DropZone from '../components/DropZone'
import Icon from '../components/Icon'
import { downloadBlobFile } from '../utils/downloads'
import { loadImageFile } from '../utils/imageFiles'

const rgbToHex = (red: number, green: number, blue: number) => `#${[red, green, blue].map((value) => value.toString(16).padStart(2, '0')).join('').toUpperCase()}`

const extractPalette = (image: HTMLImageElement, count: number) => {
  const canvas = document.createElement('canvas')
  const scale = Math.min(1, 320 / Math.max(image.naturalWidth, image.naturalHeight))
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Colour extraction is unavailable in this browser.')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
  const buckets = new Map<string, { count: number; red: number; green: number; blue: number }>()
  for (let index = 0; index < pixels.length; index += 16) {
    if (pixels[index + 3] < 160) continue
    const red = Math.min(255, Math.round(pixels[index] / 24) * 24)
    const green = Math.min(255, Math.round(pixels[index + 1] / 24) * 24)
    const blue = Math.min(255, Math.round(pixels[index + 2] / 24) * 24)
    const key = `${red},${green},${blue}`
    const bucket = buckets.get(key)
    if (bucket) bucket.count += 1
    else buckets.set(key, { count: 1, red, green, blue })
  }
  const selected: Array<{ red: number; green: number; blue: number }> = []
  const sorted = [...buckets.values()].sort((a, b) => b.count - a.count)
  for (const colour of sorted) {
    const distinct = selected.every((item) => Math.hypot(item.red - colour.red, item.green - colour.green, item.blue - colour.blue) > 62)
    if (distinct) selected.push(colour)
    if (selected.length === count) break
  }
  return selected.map(({ red, green, blue }) => rgbToHex(red, green, blue))
}

const PaletteExtractorTool = () => {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [palette, setPalette] = useState<string[]>([])
  const [colourCount, setColourCount] = useState(6)
  const [status, setStatus] = useState('Choose an image to discover its colours.')

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  const handleFile = async (nextFile: File, count = colourCount) => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(nextFile.type)) {
      setStatus('Please choose a PNG, JPEG or WebP image.')
      return
    }
    setStatus('Finding the strongest colours...')
    try {
      const { image, url } = await loadImageFile(nextFile)
      let colours: string[]
      try {
        colours = extractPalette(image, count)
      } finally {
        URL.revokeObjectURL(url)
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setFile(nextFile)
      setPreviewUrl(URL.createObjectURL(nextFile))
      setPalette(colours)
      setStatus(`${colours.length} colours extracted. Select any colour to copy it.`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'The palette could not be created.')
    }
  }

  const copyColour = async (colour: string) => {
    try {
      await navigator.clipboard.writeText(colour)
      setStatus(`${colour} copied to clipboard.`)
    } catch {
      setStatus(`Clipboard access is unavailable. The colour is ${colour}.`)
    }
  }

  const downloadPalette = () => {
    const css = `:root {\n${palette.map((colour, index) => `  --colour-${index + 1}: ${colour};`).join('\n')}\n}\n`
    downloadBlobFile(new Blob([css], { type: 'text/css' }), 'penguino-palette.css')
  }

  return (
    <div className="simple-tool">
      <aside className="tool-drawer">
        <div className="tool-drawer__heading"><span aria-label="Penguino creating a colour palette" className="tool-drawer__art tool-drawer__art--quad-sprite tool-drawer__art--palette" role="img" /><div><p>Discover</p><h1>Colour palette</h1></div></div>
        <DropZone accept="image/png,image/jpeg,image/webp" file={file} helpText="PNG, JPEG or WebP" onFile={(next) => void handleFile(next)} />
        <section className="drawer-section"><h2>Palette size</h2><div className="preset-row">{[4, 6, 8].map((count) => <button className={colourCount === count ? 'chip-button chip-button--active' : 'chip-button'} key={count} onClick={() => { setColourCount(count); if (file) void handleFile(file, count) }} type="button">{count} colours</button>)}</div></section>
        <button className="penguino-action" disabled={!palette.length} onClick={downloadPalette} type="button"><Icon name="download" /> Download palette CSS</button><p className="tool-status">{status}</p>
      </aside>
      <section className="work-canvas"><div className="work-canvas__header"><div><p>Palette</p><h2>{file?.name ?? 'Your colours will appear here'}</h2></div>{palette.length ? <span>{palette.length} colours</span> : null}</div><div className="palette-stage">{previewUrl ? <><img alt="Palette source" src={previewUrl} /><div className="extracted-palette">{palette.map((colour) => <button aria-label={`Copy ${colour}`} key={colour} onClick={() => void copyColour(colour)} style={{ backgroundColor: colour }} type="button"><span>{colour}</span></button>)}</div></> : <div className="empty-canvas"><span><Icon name="palette" /></span><h3>Find your image palette</h3><p>Upload an image to reveal its strongest colours.</p></div>}</div></section>
    </div>
  )
}

export default PaletteExtractorTool
