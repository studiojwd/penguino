import { useEffect, useState } from 'react'
import DropZone from '../components/DropZone'
import Icon from '../components/Icon'
import { downloadBlobFile, safeFileStem } from '../utils/downloads'
import { formatBytes } from '../utils/imageFiles'

const SvgOptimiserTool = () => {
  const [file, setFile] = useState<File | null>(null)
  const [source, setSource] = useState('')
  const [output, setOutput] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [outputUrl, setOutputUrl] = useState('')
  const [multipass, setMultipass] = useState(true)
  const [pretty, setPretty] = useState(false)
  const [status, setStatus] = useState('Choose an SVG to remove unnecessary code.')

  useEffect(() => () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl)
    if (outputUrl) URL.revokeObjectURL(outputUrl)
  }, [outputUrl, sourceUrl])

  const handleFile = async (nextFile: File) => {
    if (!nextFile.name.toLowerCase().endsWith('.svg') && nextFile.type !== 'image/svg+xml') {
      setStatus('Please choose an SVG file.')
      return
    }
    if (nextFile.size > 5 * 1024 * 1024) {
      setStatus('Please use an SVG smaller than 5 MB.')
      return
    }
    const text = await nextFile.text()
    setFile(nextFile)
    setSource(text)
    setOutput('')
    setSourceUrl((current) => { if (current) URL.revokeObjectURL(current); return URL.createObjectURL(new Blob([text], { type: 'image/svg+xml' })) })
    setOutputUrl((current) => { if (current) URL.revokeObjectURL(current); return '' })
    setStatus(`${formatBytes(nextFile.size)} SVG ready to optimise.`)
  }

  const handleOptimise = async () => {
    if (!source || !file) return
    setStatus('Optimising SVG...')
    try {
      const { optimize } = await import('svgo/browser')
      const result = optimize(source, { multipass, js2svg: { pretty, indent: 2 } })
      const blob = new Blob([result.data], { type: 'image/svg+xml' })
      setOutput(result.data)
      setOutputUrl((current) => { if (current) URL.revokeObjectURL(current); return URL.createObjectURL(blob) })
      const saving = Math.max(0, Math.round((1 - blob.size / file.size) * 100))
      setStatus(`${formatBytes(blob.size)} · ${saving}% smaller.`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'The SVG could not be optimised.')
    }
  }

  const handleDownload = () => {
    if (!output || !file) return
    downloadBlobFile(new Blob([output], { type: 'image/svg+xml' }), `${safeFileStem(file.name)}_optimised.svg`)
  }

  return <div className="simple-tool">
    <aside className="tool-drawer">
      <div className="tool-drawer__heading"><img alt="Penguino optimising an SVG" className="tool-drawer__art" src="/assets/penguino-svg-optimiser.webp" /><div><p>Optimise</p><h1>SVG optimiser</h1></div></div>
      <DropZone accept="image/svg+xml,.svg" file={file} helpText="SVG · up to 5 MB" onFile={(next) => void handleFile(next)} />
      <section className="drawer-section"><h2>Optimisation</h2><label className="toggle"><input checked={multipass} type="checkbox" onChange={(event) => setMultipass(event.target.checked)} /><span>Run multiple optimisation passes</span></label><label className="toggle"><input checked={pretty} type="checkbox" onChange={(event) => setPretty(event.target.checked)} /><span>Keep output code readable</span></label></section>
      {!output ? <button className="penguino-action" disabled={!source} onClick={() => void handleOptimise()} type="button"><Icon name="sparkles" /> Optimise SVG</button> : <div className="stacked-actions"><button className="penguino-action" onClick={handleDownload} type="button"><Icon name="download" /> Download optimised SVG</button><button className="secondary-button" onClick={() => void handleOptimise()} type="button">Optimise again</button></div>}<p aria-live="polite" className="tool-status">{status}</p>
    </aside>
    <section className="work-canvas"><div className="work-canvas__header"><div><p>Comparison</p><h2>{file?.name ?? 'Your SVG will appear here'}</h2></div>{file && output ? <span>{formatBytes(file.size)} → {formatBytes(new Blob([output]).size)}</span> : null}</div><div className="svg-stage">{sourceUrl ? <div className="svg-comparison"><figure><div><img alt="Original SVG preview" src={sourceUrl} /></div><figcaption>Original · {file ? formatBytes(file.size) : ''}</figcaption></figure><figure><div>{outputUrl ? <img alt="Optimised SVG preview" src={outputUrl} /> : <span className="svg-waiting"><Icon name="sparkles" />Optimise to compare</span>}</div><figcaption>Optimised {output ? `· ${formatBytes(new Blob([output]).size)}` : ''}</figcaption></figure></div> : <div className="empty-canvas"><span><Icon name="svg" /></span><h3>Add an SVG</h3><p>Compare the original and cleaned vector side by side.</p></div>}</div></section>
  </div>
}

export default SvgOptimiserTool
