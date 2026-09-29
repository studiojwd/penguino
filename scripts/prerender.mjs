import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(root, 'dist')
const pages = JSON.parse(await readFile(path.join(root, 'src/content/pageMetadata.json'), 'utf8'))
const template = await readFile(path.join(distDir, 'index.html'), 'utf8')
const siteUrl = 'https://www.penguino.app'

const escapeHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

const replaceAttribute = (html, selector, attribute, value) => {
  const escaped = escapeHtml(value)
  const expression = new RegExp(`(<${selector}[^>]*${attribute}=")[^"]*(")`)
  return html.replace(expression, `$1${escaped}$2`)
}

const nav = Object.values(pages)
  .filter((page) => page.path !== '/settings')
  .map((page) => `<a href="${page.path}">${escapeHtml(page.heading)}</a>`)
  .join('')

for (const [key, page] of Object.entries(pages)) {
  const canonical = `${siteUrl}${page.path}`
  const ogImage = `${siteUrl}${page.ogImage}`
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
    .replace('<div id="root"></div>', `<div id="root"><main class="prerendered-content"><p>Penguino browser tool</p><h1>${escapeHtml(page.heading)}</h1><p>${escapeHtml(page.intro)}</p><nav aria-label="Penguino tools">${nav}</nav></main></div>`)

  html = replaceAttribute(html, 'meta name="description"', 'content', page.description)
  html = replaceAttribute(html, 'meta property="og:url"', 'content', canonical)
  html = replaceAttribute(html, 'meta property="og:title"', 'content', page.title)
  html = replaceAttribute(html, 'meta property="og:description"', 'content', page.description)
  html = replaceAttribute(html, 'meta property="og:image"', 'content', ogImage)
  html = replaceAttribute(html, 'meta name="twitter:title"', 'content', page.title)
  html = replaceAttribute(html, 'meta name="twitter:description"', 'content', page.description)
  html = replaceAttribute(html, 'meta name="twitter:image"', 'content', ogImage)
  html = replaceAttribute(html, 'link rel="canonical"', 'href', canonical)

  html = replaceAttribute(html, 'meta name="robots"', 'content', key === 'settings' ? 'noindex, follow' : 'index, follow')

  const outputDirectory = page.path === '/' ? distDir : path.join(distDir, page.path.slice(1))
  await mkdir(outputDirectory, { recursive: true })
  await writeFile(path.join(outputDirectory, 'index.html'), html)
  if (page.path !== '/') await writeFile(path.join(distDir, `${page.path.slice(1)}.html`), html)
}

console.log(`Prerendered ${Object.keys(pages).length} routes.`)
