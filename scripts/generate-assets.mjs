import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const assetsDir = path.join(root, 'public/assets')
const ogDir = path.join(root, 'public/og')
const pages = JSON.parse(await readFile(path.join(root, 'src/content/pageMetadata.json'), 'utf8'))

await mkdir(ogDir, { recursive: true })

const webpAssets = [
  ['penguino-wave.png', 'penguino-wave.webp', 480, 480],
  ['penguino-text.png', 'penguino-text.webp', 480, 480],
  ['penguino-resize.png', 'penguino-resize.webp', 480, 480],
  ['penguino-convert.png', 'penguino-convert.webp', 480, 480],
  ['penguino-optimise.png', 'penguino-optimise.webp', 720, 480],
  ['penguino-background-remover.png', 'penguino-background-remover.webp', 720, 480],
  ['penguino-new-tools.png', 'penguino-new-tools.webp', 1440, 480],
  ['penguino-utility-tools-transparent.png', 'penguino-utility-tools-transparent.webp', 1440, 480]
]

const extraToolArtwork = [
  ['penguino-social-resizer.webp', { left: 0, top: 0, width: 591, height: 444 }],
  ['penguino-pdf-merge.webp', { left: 591, top: 0, width: 592, height: 444 }],
  ['penguino-qr-code.webp', { left: 1183, top: 0, width: 591, height: 444 }],
  ['penguino-svg-optimiser.webp', { left: 0, top: 444, width: 591, height: 443 }],
  ['penguino-watermark.webp', { left: 591, top: 444, width: 592, height: 443 }],
  ['penguino-image-splitter.webp', { left: 1183, top: 444, width: 591, height: 443 }]
]

const removeConnectedWhiteBackground = async (input) => {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const visited = new Uint8Array(info.width * info.height)
  const queue = new Int32Array(info.width * info.height)
  let head = 0
  let tail = 0
  const isBackground = (pixel) => {
    const offset = pixel * info.channels
    const red = data[offset]
    const green = data[offset + 1]
    const blue = data[offset + 2]
    return Math.min(red, green, blue) >= 232 && Math.max(red, green, blue) - Math.min(red, green, blue) <= 20
  }
  const enqueue = (pixel) => {
    if (visited[pixel] || !isBackground(pixel)) return
    visited[pixel] = 1
    queue[tail] = pixel
    tail += 1
  }

  for (let x = 0; x < info.width; x += 1) {
    enqueue(x)
    enqueue((info.height - 1) * info.width + x)
  }
  for (let y = 0; y < info.height; y += 1) {
    enqueue(y * info.width)
    enqueue(y * info.width + info.width - 1)
  }

  while (head < tail) {
    const pixel = queue[head]
    head += 1
    const x = pixel % info.width
    const y = Math.floor(pixel / info.width)
    if (x > 0) enqueue(pixel - 1)
    if (x < info.width - 1) enqueue(pixel + 1)
    if (y > 0) enqueue(pixel - info.width)
    if (y < info.height - 1) enqueue(pixel + info.width)
  }

  for (let pixel = 0; pixel < visited.length; pixel += 1) {
    if (visited[pixel]) data[pixel * info.channels + 3] = 0
  }
  return sharp(data, { raw: info }).png().toBuffer()
}

for (const [input, output, width, height] of webpAssets) {
  await sharp(path.join(assetsDir, input))
    .resize({ width, height, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 84, alphaQuality: 90, effort: 5 })
    .toFile(path.join(assetsDir, output))
}

const extraToolsSource = path.join(assetsDir, 'penguino-extra-tools-source.png')
for (const [output, extract] of extraToolArtwork) {
  const cell = await sharp(extraToolsSource).extract(extract).png().toBuffer()
  const transparent = await removeConnectedWhiteBackground(cell)
  await sharp(transparent)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 8 })
    .resize({ width: 480, height: 420, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 94, effort: 5 })
    .toFile(path.join(assetsDir, output))
}

const art = {
  home: { file: 'penguino-wave.png' },
  text: { file: 'penguino-text.png' },
  resize: { file: 'penguino-resize.png' },
  convert: { file: 'penguino-convert.png' },
  optimise: { file: 'penguino-optimise.png' },
  'remove-background': { file: 'penguino-background-remover.png' },
  favicon: { file: 'penguino-new-tools.png', extract: { left: 0, top: 0, width: 724, height: 724 } },
  'bulk-resize': { file: 'penguino-new-tools.png', extract: { left: 724, top: 0, width: 724, height: 724 } },
  'pdf-compress': { file: 'penguino-utility-tools-transparent.png', extract: { left: 1086, top: 0, width: 543, height: 724 } },
  metadata: { file: 'penguino-utility-tools-transparent.png', extract: { left: 0, top: 0, width: 543, height: 724 } },
  pack: { file: 'penguino-utility-tools-transparent.png', extract: { left: 543, top: 0, width: 543, height: 724 } },
  palette: { file: 'penguino-utility-tools-transparent.png', extract: { left: 1629, top: 0, width: 543, height: 724 } },
  'social-resize': { file: 'penguino-social-resizer.webp' },
  'pdf-merge': { file: 'penguino-pdf-merge.webp' },
  qr: { file: 'penguino-qr-code.webp' },
  'svg-optimise': { file: 'penguino-svg-optimiser.webp' },
  watermark: { file: 'penguino-watermark.webp' },
  split: { file: 'penguino-image-splitter.webp' },
  settings: { file: 'penguino-wave.png' },
  about: { file: 'penguino-wave.png' },
  terms: { file: 'penguino-wave.png' }
}

const escapeXml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const titleLines = (value) => {
  const words = value.split(' ')
  const lines = ['']
  for (const word of words) {
    const current = lines.at(-1)
    if (current && `${current} ${word}`.length > 18 && lines.length < 3) lines.push(word)
    else lines[lines.length - 1] = current ? `${current} ${word}` : word
  }
  return lines
}

for (const [key, page] of Object.entries(pages)) {
  const lines = titleLines(page.heading)
  const title = lines.map((line, index) => `<tspan x="74" dy="${index === 0 ? 0 : 72}">${escapeXml(line)}</tspan>`).join('')
  const backdrop = Buffer.from(`<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFFDF9"/><stop offset="1" stop-color="#FFE9D9"/></linearGradient><radialGradient id="glow"><stop stop-color="#FFB270" stop-opacity=".42"/><stop offset="1" stop-color="#FFB270" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="630" rx="0" fill="url(#bg)"/><circle cx="1010" cy="95" r="300" fill="url(#glow)"/><circle cx="1080" cy="560" r="220" fill="#FFDCC5" opacity=".52"/><text x="74" y="72" fill="#FF641F" font-family="Arial, sans-serif" font-size="23" font-weight="800" letter-spacing="2">PENGUINO • FREE BROWSER TOOL</text><text x="74" y="178" fill="#0B234D" font-family="Arial, sans-serif" font-size="64" font-weight="800" letter-spacing="-2">${title}</text><text x="74" y="535" fill="#42516D" font-family="Arial, sans-serif" font-size="25">Simple tools. Useful jobs. No fuss.</text><text x="74" y="577" fill="#0B234D" font-family="Arial, sans-serif" font-size="26" font-weight="800">penguino.app</text></svg>`)
  const source = art[key]
  let artwork = sharp(path.join(assetsDir, source.file))
  if (source.extract) artwork = artwork.extract(source.extract)
  const artworkBuffer = await artwork
    .ensureAlpha()
    .resize({ width: 470, height: 500, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
  const filename = page.ogImage.split('/').at(-1)
  await sharp(backdrop).composite([{ input: artworkBuffer, left: 700, top: 74 }]).png({ compressionLevel: 9 }).toFile(path.join(ogDir, filename))
}

console.log(`Generated ${webpAssets.length + extraToolArtwork.length} optimised assets and ${Object.keys(pages).length} social cards.`)
