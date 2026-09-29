import { useEffect, useState } from 'react'
import Icon from '../components/Icon'
import { trackProcessingFailed } from '../utils/analytics'
import { downloadBlobFile } from '../utils/downloads'

type ErrorLevel = 'L' | 'M' | 'Q' | 'H'

const QrCodeGeneratorTool = () => {
  const [value, setValue] = useState('https://www.penguino.app/')
  const [size, setSize] = useState(1024)
  const [margin, setMargin] = useState(4)
  const [dark, setDark] = useState('#0b234d')
  const [light, setLight] = useState('#ffffff')
  const [level, setLevel] = useState<ErrorLevel>('M')
  const [preview, setPreview] = useState('')
  const [status, setStatus] = useState('Enter a URL or message to create a QR code.')

  useEffect(() => {
    if (!value.trim()) {
      setPreview('')
      return
    }
    let cancelled = false
    const timer = window.setTimeout(() => {
      import('qrcode').then((QRCode) => QRCode.toDataURL(value, { width: Math.min(size, 640), margin, errorCorrectionLevel: level, color: { dark, light } })).then((url) => {
        if (!cancelled) {
          setPreview(url)
          setStatus('QR code is ready. Test it before publishing.')
        }
      }).catch(() => { if (!cancelled) setStatus('The QR code could not be generated.') })
    }, 140)
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [dark, level, light, margin, size, value])

  const downloadPng = async () => {
    if (!value.trim()) return
    setStatus('Preparing PNG...')
    try {
      const QRCode = await import('qrcode')
      const dataUrl = await QRCode.toDataURL(value, { width: size, margin, errorCorrectionLevel: level, color: { dark, light } })
      const blob = await fetch(dataUrl).then((response) => response.blob())
      downloadBlobFile(blob, 'penguino-qr-code.png', { operation: 'create_qr', output_width: size, output_height: size, error_correction: level })
      setStatus(`${size} × ${size}px PNG downloaded.`)
    } catch (error) {
      trackProcessingFailed('qr-code-generator', 'create_qr_png', error)
      setStatus('The PNG could not be generated.')
    }
  }

  const downloadSvg = async () => {
    if (!value.trim()) return
    setStatus('Preparing SVG...')
    try {
      const QRCode = await import('qrcode')
      const svg = await QRCode.toString(value, { type: 'svg', margin, errorCorrectionLevel: level, color: { dark, light } })
      downloadBlobFile(new Blob([svg], { type: 'image/svg+xml' }), 'penguino-qr-code.svg', { operation: 'create_qr', error_correction: level })
      setStatus('Scalable SVG downloaded.')
    } catch (error) {
      trackProcessingFailed('qr-code-generator', 'create_qr_svg', error)
      setStatus('The SVG could not be generated.')
    }
  }

  return <div className="simple-tool">
    <aside className="tool-drawer">
      <div className="tool-drawer__heading"><img alt="Penguino holding a QR code" className="tool-drawer__art" src="/assets/penguino-qr-code.webp" /><div><p>Create</p><h1>QR code generator</h1></div></div>
      <section className="drawer-section"><h2>Content</h2><label className="field"><span>URL or message</span><textarea rows={5} value={value} onChange={(event) => setValue(event.target.value)} /></label><label className="field"><span>Error correction</span><select value={level} onChange={(event) => setLevel(event.target.value as ErrorLevel)}><option value="L">Low · smallest</option><option value="M">Medium · recommended</option><option value="Q">Quartile</option><option value="H">High · most resilient</option></select></label></section>
      <section className="drawer-section"><h2>Style</h2><div className="split-fields"><label className="field"><span>Foreground</span><input type="color" value={dark.slice(0, 7)} onChange={(event) => setDark(event.target.value)} /></label><label className="field"><span>Background</span><input type="color" value={light.slice(0, 7)} onChange={(event) => setLight(event.target.value)} /></label></div><label className="field"><span>Quiet zone {margin} modules</span><input max="10" min="0" type="range" value={margin} onChange={(event) => setMargin(Number(event.target.value))} /></label><label className="field"><span>PNG size</span><select value={size} onChange={(event) => setSize(Number(event.target.value))}><option value="512">512 × 512px</option><option value="1024">1024 × 1024px</option><option value="2048">2048 × 2048px</option></select></label></section>
      <div className="stacked-actions"><button className="penguino-action" disabled={!preview} onClick={() => void downloadPng()} type="button"><Icon name="download" /> Download PNG</button><button className="secondary-button" disabled={!preview} onClick={() => void downloadSvg()} type="button">Download SVG</button></div><p aria-live="polite" className="tool-status">{status}</p>
    </aside>
    <section className="work-canvas"><div className="work-canvas__header"><div><p>Live preview</p><h2>Your scannable QR code</h2></div><span>{level} correction</span></div><div className="qr-stage">{preview ? <div className="qr-preview"><img alt="Generated QR code preview" src={preview} /><p>Always scan and test the final code before printing.</p></div> : <div className="empty-canvas"><span><Icon name="qr" /></span><h3>Enter some content</h3><p>Your QR code will update automatically.</p></div>}</div></section>
  </div>
}

export default QrCodeGeneratorTool
