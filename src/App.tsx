import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Icon, { type IconName } from './components/Icon'
import PenguinMascot from './components/PenguinMascot'
import pageMetadata from './content/pageMetadata.json'
import { toolSeoContent, type ToolPage } from './content/toolSeo'
import { clearLocalUsageStats, formatLocalBytes, getLocalUsageStats, subscribeToLocalUsageStats, trackEvent } from './utils/analytics'

const TextGraphicTool = lazy(() => import('./tools/TextGraphicTool'))
const ImageResizerTool = lazy(() => import('./tools/ImageResizerTool'))
const FileConverterTool = lazy(() => import('./tools/FileConverterTool'))
const ImageOptimiserTool = lazy(() => import('./tools/ImageOptimiserTool'))
const BackgroundRemoverTool = lazy(() => import('./tools/BackgroundRemoverTool'))
const FaviconGeneratorTool = lazy(() => import('./tools/FaviconGeneratorTool'))
const BulkImageResizerTool = lazy(() => import('./tools/BulkImageResizerTool'))
const PdfCompressorTool = lazy(() => import('./tools/PdfCompressorTool'))
const MetadataRemoverTool = lazy(() => import('./tools/MetadataRemoverTool'))
const FilePackerTool = lazy(() => import('./tools/FilePackerTool'))
const PaletteExtractorTool = lazy(() => import('./tools/PaletteExtractorTool'))
const SocialMediaResizerTool = lazy(() => import('./tools/SocialMediaResizerTool'))
const PdfMergeExtractTool = lazy(() => import('./tools/PdfMergeExtractTool'))
const QrCodeGeneratorTool = lazy(() => import('./tools/QrCodeGeneratorTool'))
const SvgOptimiserTool = lazy(() => import('./tools/SvgOptimiserTool'))
const WatermarkTool = lazy(() => import('./tools/WatermarkTool'))
const ImageSplitterTool = lazy(() => import('./tools/ImageSplitterTool'))

type Page = keyof typeof pageMetadata

const PAGE_KEY = 'penguino/active-page/v1'
const FAVOURITES_KEY = 'penguino/favourites/v1'
const RECENT_TOOLS_KEY = 'penguino/recent-tools/v1'
const SIDEBAR_GROUPS_KEY = 'penguino/sidebar-groups/v1'
const SIDEBAR_COLLAPSED_KEY = 'penguino/sidebar-collapsed/v1'
const SITE_URL = 'https://www.penguino.app'

const PAGE_METADATA = pageMetadata

const isPage = (value: string): value is Page => Object.prototype.hasOwnProperty.call(PAGE_METADATA, value)

const tools: Array<{
  page: ToolPage
  path: string
  icon: IconName
  eyebrow: string
  title: string
  navTitle?: string
  description: string
  tone: string
  artwork?: string
  artworkPosition?: string
  artworkColumns?: 4
  blendArtwork?: boolean
}> = [
  { page: 'text', path: '/text-graphic', icon: 'type', eyebrow: 'Create', title: 'Text graphic', description: 'Turn words into crisp, on-brand graphics.', tone: 'orange', artwork: '/assets/penguino-text.webp' },
  { page: 'resize', path: '/image-resizer', icon: 'resize', eyebrow: 'Resize', title: 'Image resizer', description: 'Resize images to exact pixel dimensions.', tone: 'blue', artwork: '/assets/penguino-resize.webp' },
  { page: 'convert', path: '/file-converter', icon: 'convert', eyebrow: 'Convert', title: 'File converter', description: 'Switch between PNG, JPEG and WebP.', tone: 'pink', artwork: '/assets/penguino-convert.webp' },
  { page: 'optimise', path: '/image-optimiser', icon: 'sparkles', eyebrow: 'Optimise', title: 'Image optimiser', description: 'Compress images and compare quality before downloading.', tone: 'cyan', artwork: '/assets/penguino-optimise.webp', blendArtwork: true },
  { page: 'remove-background', path: '/background-remover', icon: 'image', eyebrow: 'Remove', title: 'Background remover', navTitle: 'Remove BG', description: 'Remove simple backgrounds and export a transparent PNG.', tone: 'violet', artwork: '/assets/penguino-background-remover.webp' },
  { page: 'favicon', path: '/favicon-generator', icon: 'favicon', eyebrow: 'Create', title: 'Favicon generator', description: 'Create a complete favicon package from one image.', tone: 'yellow', artwork: '/assets/penguino-new-tools.webp', artworkPosition: 'left' },
  { page: 'bulk-resize', path: '/bulk-image-resizer', icon: 'layers', eyebrow: 'Resize', title: 'Bulk image resizer', description: 'Resize multiple images with one set of dimensions.', tone: 'mint', artwork: '/assets/penguino-new-tools.webp', artworkPosition: 'center' },
  { page: 'pdf-compress', path: '/pdf-compressor', icon: 'pdf', eyebrow: 'Compress', title: 'PDF compressor', description: 'Reduce PDF file size locally in your browser.', tone: 'lavender', artwork: '/assets/penguino-utility-tools-transparent.webp', artworkPosition: '66.666%', artworkColumns: 4 },
  { page: 'metadata', path: '/metadata-remover', icon: 'shield', eyebrow: 'Protect', title: 'Metadata remover', description: 'Strip hidden information from images.', tone: 'mint', artwork: '/assets/penguino-utility-tools-transparent.webp', artworkPosition: '0%', artworkColumns: 4 },
  { page: 'pack', path: '/file-packer', icon: 'archive', eyebrow: 'Bundle', title: 'File packer', description: 'Put up to 50 files into one tidy ZIP.', tone: 'orange', artwork: '/assets/penguino-utility-tools-transparent.webp', artworkPosition: '33.333%', artworkColumns: 4 },
  { page: 'palette', path: '/colour-palette-extractor', icon: 'palette', eyebrow: 'Discover', title: 'Colour palette', description: 'Pull useful HEX colours from any image.', tone: 'pink', artwork: '/assets/penguino-utility-tools-transparent.webp', artworkPosition: '100%', artworkColumns: 4 },
  { page: 'social-resize', path: '/social-media-resizer', icon: 'social', eyebrow: 'Social', title: 'Social media resizer', navTitle: 'Social resizer', description: 'Crop images to popular social media sizes.', tone: 'blue', artwork: '/assets/penguino-social-resizer.webp' },
  { page: 'pdf-merge', path: '/pdf-merger-extractor', icon: 'merge', eyebrow: 'PDF', title: 'PDF merger & extractor', navTitle: 'PDF merge & extract', description: 'Combine PDFs or extract the pages you need.', tone: 'pink', artwork: '/assets/penguino-pdf-merge.webp' },
  { page: 'qr', path: '/qr-code-generator', icon: 'qr', eyebrow: 'Create', title: 'QR code generator', navTitle: 'QR code', description: 'Create downloadable QR codes as PNG or SVG.', tone: 'yellow', artwork: '/assets/penguino-qr-code.webp' },
  { page: 'svg-optimise', path: '/svg-optimiser', icon: 'svg', eyebrow: 'Optimise', title: 'SVG optimiser', description: 'Clean SVG code and reduce vector file size.', tone: 'mint', artwork: '/assets/penguino-svg-optimiser.webp' },
  { page: 'watermark', path: '/watermark-tool', icon: 'watermark', eyebrow: 'Protect', title: 'Watermark tool', description: 'Add a custom text watermark to an image.', tone: 'lavender', artwork: '/assets/penguino-watermark.webp' },
  { page: 'split', path: '/image-splitter', icon: 'split', eyebrow: 'Divide', title: 'Image splitter', description: 'Split one image into a grid of downloadable tiles.', tone: 'cyan', artwork: '/assets/penguino-image-splitter.webp' }
]

const toolPages = new Set<ToolPage>(tools.map((tool) => tool.page))

type ToolGroupId = 'create' | 'images' | 'files' | 'pdf'

const toolGroups: Array<{ id: ToolGroupId; label: string; pages: ToolPage[] }> = [
  { id: 'create', label: 'Create', pages: ['text', 'qr', 'favicon', 'palette'] },
  { id: 'images', label: 'Images', pages: ['resize', 'bulk-resize', 'social-resize', 'optimise', 'remove-background', 'watermark', 'split'] },
  { id: 'files', label: 'Files & conversion', pages: ['convert', 'svg-optimise', 'metadata', 'pack'] },
  { id: 'pdf', label: 'PDF tools', pages: ['pdf-compress', 'pdf-merge'] }
]

const readSidebarGroups = (): ToolGroupId[] => {
  try {
    const value = JSON.parse(window.localStorage.getItem(SIDEBAR_GROUPS_KEY) ?? '[]')
    const validIds = new Set(toolGroups.map((group) => group.id))
    return Array.isArray(value) ? value.filter((id): id is ToolGroupId => typeof id === 'string' && validIds.has(id as ToolGroupId)) : []
  } catch {
    return []
  }
}

const relatedTools: Record<ToolPage, ToolPage[]> = {
  text: ['palette', 'resize', 'qr'],
  resize: ['bulk-resize', 'social-resize', 'optimise'],
  convert: ['optimise', 'resize', 'metadata'],
  optimise: ['resize', 'convert', 'bulk-resize'],
  'remove-background': ['optimise', 'resize', 'palette'],
  favicon: ['text', 'palette', 'resize'],
  'bulk-resize': ['resize', 'optimise', 'pack'],
  'pdf-compress': ['pdf-merge', 'pack', 'metadata'],
  metadata: ['optimise', 'convert', 'pack'],
  pack: ['bulk-resize', 'pdf-compress', 'metadata'],
  palette: ['text', 'optimise', 'remove-background'],
  'social-resize': ['resize', 'watermark', 'split'],
  'pdf-merge': ['pdf-compress', 'pack', 'metadata'],
  qr: ['text', 'svg-optimise', 'favicon'],
  'svg-optimise': ['favicon', 'qr', 'convert'],
  watermark: ['social-resize', 'resize', 'metadata'],
  split: ['social-resize', 'bulk-resize', 'pack']
}

const readStoredTools = (key: string): ToolPage[] => {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? '[]')
    return Array.isArray(value) ? value.filter((page): page is ToolPage => typeof page === 'string' && toolPages.has(page as ToolPage)) : []
  } catch {
    return []
  }
}

const pathToPage = (pathname: string): Page => {
  const tool = tools.find((item) => item.path === pathname)
  if (tool) return tool.page
  if (pathname === '/settings') return 'settings'
  if (pathname === '/about') return 'about'
  if (pathname === '/terms') return 'terms'
  return 'home'
}

const pageToPath = (page: Page) => {
  if (page === 'settings') return '/settings'
  if (page === 'about') return '/about'
  if (page === 'terms') return '/terms'
  return PAGE_METADATA[page].path
}

const readInitialPage = (): Page => {
  const hash = window.location.hash.replace('#/', '')
  if (isPage(hash)) return hash
  return pathToPage(window.location.pathname)
}

const Dashboard = ({ favourites, recentTools, onOpen, onToggleFavourite }: {
  favourites: ToolPage[]
  recentTools: ToolPage[]
  onOpen: (page: Page) => void
  onToggleFavourite: (page: ToolPage) => void
}) => (
  <div className="dashboard">
    <section className="dashboard-hero">
      <div className="dashboard-hero__copy">
        <p className="dashboard-kicker">Your creative toolkit</p>
        <h1>Create.<br />Resize.<br />Convert.</h1>
        <p>Simple, private tools for turning everyday ideas into polished visuals, right in your browser.</p>
        <a className="penguino-action penguino-action--hero" href="/text-graphic" onClick={(event) => { event.preventDefault(); onOpen('text') }}>Start creating <Icon name="arrow" /></a>
      </div>
      <div className="dashboard-hero__art" aria-hidden="true">
        <span className="floating-tile floating-tile--image"><Icon name="image" /></span>
        <span className="floating-tile floating-tile--type">T</span>
        <PenguinMascot />
        <span className="hero-scribble">Big ideas,<br />made easier.</span>
      </div>
    </section>

    {favourites.length || recentTools.length ? <section className="tool-shortcuts" aria-label="Your tools">
      {favourites.length ? <div><p>Favourites</p><div className="tool-shortcuts__links">{favourites.map((page) => {
        const tool = tools.find((item) => item.page === page)
        return tool ? <a href={tool.path} key={page} onClick={(event) => { event.preventDefault(); onOpen(page) }}><Icon name={tool.icon} /><span>{tool.navTitle ?? tool.title}</span></a> : null
      })}</div></div> : null}
      {recentTools.length ? <div><p>Recently used</p><div className="tool-shortcuts__links">{recentTools.map((page) => {
        const tool = tools.find((item) => item.page === page)
        return tool ? <a href={tool.path} key={page} onClick={(event) => { event.preventDefault(); onOpen(page) }}><Icon name={tool.icon} /><span>{tool.navTitle ?? tool.title}</span></a> : null
      })}</div></div> : null}
    </section> : null}

    <section className="tool-grid" aria-labelledby="tools-heading">
      <div className="section-heading"><div><p>Pick a tool</p><h2 id="tools-heading">What are we making today?</h2></div><span>Everything stays on your device</span></div>
      <div className="tool-card-grid">
        {tools.map((tool, index) => (
          <div className="tool-card-wrap" key={tool.page} style={{ animationDelay: `${index * 80}ms` }}>
            <a className={`tool-card tool-card--${tool.tone}`} href={tool.path} onClick={(event) => { event.preventDefault(); onOpen(tool.page) }}>
              <span className="tool-card__visual">{tool.artwork ? tool.artworkColumns === 4 ? <span aria-hidden="true" className="tool-card__quad-artwork" style={{ backgroundImage: `url(${tool.artwork})`, backgroundPosition: `${tool.artworkPosition} center` }} /> : <img alt="" className={[tool.artworkPosition ? 'tool-card__sprite-artwork' : '', tool.blendArtwork ? 'tool-card__blend-artwork' : ''].filter(Boolean).join(' ') || undefined} decoding="async" loading="lazy" src={tool.artwork} style={tool.artworkPosition ? { objectPosition: tool.artworkPosition } : undefined} /> : <span className="tool-card__placeholder"><Icon name={tool.icon} /></span>}<i /></span>
              <span className="tool-card__copy"><small>{tool.eyebrow}</small><strong>{tool.title}</strong><span>{tool.description}</span></span>
              <span className="tool-card__arrow"><Icon name="arrow" /></span>
            </a>
            <button aria-label={`${favourites.includes(tool.page) ? 'Remove' : 'Add'} ${tool.title} ${favourites.includes(tool.page) ? 'from' : 'to'} favourites`} aria-pressed={favourites.includes(tool.page)} className={`tool-favourite ${favourites.includes(tool.page) ? 'tool-favourite--active' : ''}`} onClick={() => onToggleFavourite(tool.page)} type="button"><Icon name="star" /></button>
          </div>
        ))}
      </div>
    </section>

    <section className="privacy-note"><span><Icon name="sparkles" /></span><div><strong>Creative work, kept private.</strong><p>Penguino runs locally. Your images and brand presets never need to leave this browser.</p></div></section>
  </div>
)

const RelatedTools = ({ page, onOpen }: { page: ToolPage; onOpen: (page: Page) => void }) => (
  <section className="related-tools" aria-labelledby="related-tools-heading">
    <div className="section-heading"><div><p>Keep going</p><h2 id="related-tools-heading">Related tools</h2></div></div>
    <div className="related-tools__grid">{relatedTools[page].map((relatedPage) => {
      const tool = tools.find((item) => item.page === relatedPage)
      return tool ? <a href={tool.path} key={tool.page} onClick={(event) => { event.preventDefault(); onOpen(tool.page) }}><span><Icon name={tool.icon} /></span><div><strong>{tool.title}</strong><p>{tool.description}</p></div><Icon name="arrow" /></a> : null
    })}</div>
  </section>
)

const ToolIntro = ({ page }: { page: ToolPage }) => {
  const content = toolSeoContent[page]
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } }))
  }

  return <section className="tool-seo-intro"><header><p className="tool-seo-intro__eyebrow">Free browser-based tool</p><h2>{content.heading}</h2>{content.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</header><div className="tool-seo-intro__sections">{content.sections.map((section) => <section key={section.heading}><h3>{section.heading}</h3>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}</div><section className="tool-seo-intro__steps"><h3>How to use this tool</h3><ol>{content.steps.map((step) => <li key={step}>{step}</li>)}</ol></section><section className="tool-seo-intro__faq"><h3>Frequently asked questions</h3>{content.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section><script dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} type="application/ld+json" /></section>
}

const SettingsPage = () => {
  const [stats, setStats] = useState(getLocalUsageStats)

  useEffect(() => subscribeToLocalUsageStats(() => setStats(getLocalUsageStats())), [])

  const topToolEntry = Object.entries(stats.toolDownloads).sort(([, left], [, right]) => right - left)[0]
  const topTool = topToolEntry ? tools.find((tool) => tool.path.slice(1) === topToolEntry[0] || tool.page === topToolEntry[0]) : undefined
  const topFormat = Object.entries(stats.formats).sort(([, left], [, right]) => right - left)[0]?.[0]

  return (
    <div className="placeholder-page settings-page">
      <section className="placeholder-card settings-card">
        <header className="settings-card__header">
          <span className="placeholder-card__icon"><Icon name="settings" /></span>
          <div><p>Your activity</p><h1>Penguino stats</h1><p>Private totals from the work you do in this browser.</p></div>
        </header>

        <div className="usage-stats-grid">
          <article><span>Files selected</span><strong>{stats.filesSelected.toLocaleString()}</strong><small>Files stay on this device</small></article>
          <article><span>Files processed</span><strong>{stats.filesProcessed.toLocaleString()}</strong><small>Across {stats.downloads.toLocaleString()} downloads</small></article>
          <article><span>Space saved</span><strong>{formatLocalBytes(stats.bytesSaved)}</strong><small>From comparable exports</small></article>
          <article><span>Data processed</span><strong>{formatLocalBytes(stats.inputBytes)}</strong><small>Locally on this device</small></article>
        </div>

        <div className="usage-highlights">
          <div><span>Most-used tool</span><strong>{topTool?.title ?? (topToolEntry?.[0] ? topToolEntry[0].replace(/-/g, ' ') : 'No exports yet')}</strong></div>
          <div><span>Favourite format</span><strong>{topFormat?.toUpperCase() ?? 'No exports yet'}</strong></div>
          <div><span>Last activity</span><strong>{stats.updatedAt ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(stats.updatedAt)) : 'Ready when you are'}</strong></div>
        </div>

        <aside className="settings-privacy-note"><Icon name="shield" /><div><strong>Your files stay private.</strong><p>These personal totals are stored only in this browser. Product analytics never include filenames, image content, entered text or QR destinations.</p></div></aside>
        <button className="secondary-button settings-clear-button" disabled={!stats.updatedAt} onClick={clearLocalUsageStats} type="button">Clear my local stats</button>
      </section>
    </div>
  )
}

const TermsPage = () => (
  <div className="terms-page">
    <article className="terms-document">
      <header className="terms-header">
        <span className="terms-header__icon"><Icon name="document" /></span>
        <p>Legal</p>
        <h1>Terms &amp; Conditions</h1>
        <strong>Last updated: September 2026</strong>
      </header>

      <div className="terms-intro">
        <h2>Welcome to Penguino 👋</h2>
        <p>Penguino is a collection of free, simple tools designed to make everyday digital tasks a little easier.</p>
        <p>By using Penguino, you agree to the following:</p>
      </div>

      <section><h2>Free to use</h2><p>Penguino is free to use for personal or commercial purposes. There’s no guarantee that every tool will always be available, remain free, or work exactly the same forever.</p><p>We may add, change or remove tools as Penguino evolves.</p></section>

      <section><h2>Use at your own risk</h2><p>We do our best to make Penguino useful and reliable, but the tools are provided <strong>“as is”</strong> and without warranties or guarantees.</p><p>You’re responsible for checking any files, images, PDFs or other outputs before using them.</p><p>Penguino and StudioJWD are not responsible for any loss, damage, errors, corrupted files, loss of quality, missed deadlines or other issues resulting from your use of the tools or their outputs.</p><p className="terms-aside">Basically: please check your work before sending 10,000 brochures to print.</p></section>

      <section><h2>Your files</h2><p>You’re responsible for making sure you have the right to use any files or content you upload to Penguino.</p><p>Where a tool processes files locally in your browser, those files stay on your device. If a particular tool requires files to be sent to a server or third-party service, we’ll aim to make that clear.</p><p>Please don’t use Penguino to process anything illegal, harmful, malicious or that infringes someone else’s rights.</p></section>

      <section><h2>No professional advice</h2><p>Penguino is a handy collection of tools, not professional legal, financial, technical or other specialist advice.</p></section>

      <section><h2>Availability</h2><p>Penguino is a side project. Things might occasionally break. Penguins aren't known for their uptime guarantees.</p><p>We may change, suspend or discontinue any part of Penguino at any time.</p></section>

      <section><h2>Who built this?</h2><p>Penguino is built and maintained by <a href="https://studiojwd.com/" rel="noopener noreferrer" target="_blank">StudioJWD</a>.</p><p>By using Penguino, you acknowledge that you’re using the service at your own discretion and risk.</p></section>

      <footer className="terms-closing">Most importantly: have fun, make something useful, and hopefully save yourself a bit of time.</footer>
    </article>
  </div>
)

const AboutPage = () => (
  <div className="terms-page about-page">
    <article className="terms-document about-document">
      <header className="terms-header about-header">
        <span className="terms-header__icon about-header__icon"><Icon name="sparkles" /></span>
        <p>Our story</p>
        <h1>Meet Penguino 🐧</h1>
        <strong>Small tools. Useful jobs. No fuss.</strong>
      </header>

      <div className="terms-intro about-intro">
        <p>Penguino is a collection of free tools for designers, marketers and anyone else who just needs to get a simple job done.</p>
        <p>Resize a bunch of images. Compress a PDF. Make a favicon. Convert a file. Do the thing and get on with your day.</p>
        <p>No unnecessarily complicated software. No learning curve for something you need to do once. And, wherever possible, no uploading your files somewhere just to make a tiny change.</p>
      </div>

      <section><h2>Why does Penguino exist?</h2><p>Because some jobs should just be easy.</p><p>Over the years, I’ve lost count of how many times I’ve searched for a simple online tool, only to find something covered in ads, hidden behind a signup form, or asking for a subscription just as I’m about to download the result.</p><p>Penguino is my attempt to make those little jobs a bit nicer.</p><p className="about-manifesto">Simple tools, thoughtfully designed, free to use.<br />And a penguin. Obviously.</p></section>

      <section><h2>Who made it?</h2><p>Hi, I’m <strong>Jon Whitby</strong>, the designer, marketer and general tinkerer behind Penguino.</p><p>I started my career as a graphic designer and, over nearly two decades, have worked across design, digital products, marketing, analytics and growth for startups and larger businesses around the world.</p><p>Today I run <a href="https://studiojwd.com/" rel="noopener noreferrer" target="_blank">StudioJWD</a>, where I bring those worlds together — using design, strategy, data and technology to help businesses create better digital experiences and grow.</p><p>Penguino is a StudioJWD side project. It’s a place to build the small tools I wish existed when I need to get something done quickly.</p><p>Nothing revolutionary.</p><p>Just useful little things, made well.</p></section>

      <footer className="terms-closing about-closing">Enjoy Penguino. 🐧</footer>
    </article>
  </div>
)

const SidebarTools = ({ favourites, page, onOpen }: {
  favourites: ToolPage[]
  page: Page
  onOpen: (page: Page) => void
}) => {
  const activeGroup = toolGroups.find((group) => group.pages.includes(page as ToolPage))?.id
  const [query, setQuery] = useState('')
  const [openGroups, setOpenGroups] = useState<ToolGroupId[]>(() => {
    const stored = readSidebarGroups()
    if (activeGroup && !stored.includes(activeGroup)) return [...stored, activeGroup]
    return stored.length ? stored : [activeGroup ?? 'create']
  })
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const favouriteTools = favourites.map((favourite) => tools.find((tool) => tool.page === favourite)).filter((tool): tool is (typeof tools)[number] => Boolean(tool))
  const matchingGroups = toolGroups.map((group) => ({
    ...group,
    tools: group.pages.map((toolPage) => tools.find((tool) => tool.page === toolPage)).filter((tool): tool is (typeof tools)[number] => Boolean(tool)).filter((tool) => !normalizedQuery || `${tool.title} ${tool.navTitle ?? ''} ${tool.eyebrow}`.toLocaleLowerCase().includes(normalizedQuery))
  })).filter((group) => group.tools.length)

  useEffect(() => {
    if (!activeGroup) return
    setOpenGroups((current) => current.includes(activeGroup) ? current : [...current, activeGroup])
    const frame = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('.sidebar-tool-scroll .nav-item--active')?.scrollIntoView({ block: 'nearest' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [activeGroup, page])

  const toggleGroup = (groupId: ToolGroupId) => {
    setOpenGroups((current) => {
      const next = current.includes(groupId) ? current.filter((id) => id !== groupId) : [...current, groupId]
      window.localStorage.setItem(SIDEBAR_GROUPS_KEY, JSON.stringify(next))
      return next
    })
  }

  const toolLink = (tool: (typeof tools)[number], compact = false) => <a aria-current={page === tool.page ? 'page' : undefined} className={`${page === tool.page ? 'nav-item nav-item--active' : 'nav-item'}${compact ? ' nav-item--compact' : ''}`} href={tool.path} key={tool.page} onClick={(event) => { event.preventDefault(); if (normalizedQuery) trackEvent('navigation_search_used', { selected_tool: tool.path.slice(1), query_length: normalizedQuery.length, result_count: matchingGroups.reduce((count, group) => count + group.tools.length, 0) }); onOpen(tool.page) }}><Icon name={tool.icon} /><span>{tool.navTitle ?? tool.title}</span></a>

  return <div className="sidebar-tool-browser">
    <label className="sidebar-search">
      <span className="visually-hidden">Find a tool</span>
      <Icon name="search" />
      <input autoComplete="off" onChange={(event) => setQuery(event.target.value)} placeholder="Find a tool..." type="search" value={query} />
    </label>

    <div className="sidebar-tool-scroll">
      {!normalizedQuery && favouriteTools.length ? <section className="sidebar-favourites" aria-labelledby="sidebar-favourites-heading">
        <h2 id="sidebar-favourites-heading"><Icon name="star" /> Favourites</h2>
        <div>{favouriteTools.map((tool) => toolLink(tool, true))}</div>
      </section> : null}

      <nav className="sidebar-tool-groups" aria-label="Tools">
        {matchingGroups.map((group) => {
          const isOpen = normalizedQuery.length > 0 || openGroups.includes(group.id)
          return <section className={`sidebar-tool-group ${isOpen ? 'sidebar-tool-group--open' : ''}`} key={group.id}>
            <button aria-controls={`sidebar-group-${group.id}`} aria-expanded={isOpen} disabled={Boolean(normalizedQuery)} onClick={() => toggleGroup(group.id)} type="button"><span>{group.label}</span><small>{group.tools.length}</small><i aria-hidden="true" /></button>
            <div id={`sidebar-group-${group.id}`}>{isOpen ? group.tools.map((tool) => toolLink(tool)) : null}</div>
          </section>
        })}
      </nav>
      {normalizedQuery && !matchingGroups.length ? <p className="sidebar-empty">No tools found. Try a different search.</p> : null}
    </div>
  </div>
}

const App = () => {
  const [page, setPage] = useState<Page>(readInitialPage)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(() => window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true')
  const [favourites, setFavourites] = useState<ToolPage[]>(() => readStoredTools(FAVOURITES_KEY))
  const [recentTools, setRecentTools] = useState<ToolPage[]>(() => readStoredTools(RECENT_TOOLS_KEY))
  const sidebarRef = useRef<HTMLElement>(null)
  const sidebarCollapseRef = useRef<HTMLButtonElement>(null)
  const sidebarTabRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const setDesktopSidebar = (collapsed: boolean) => {
    setDesktopSidebarCollapsed(collapsed)
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed))
    window.requestAnimationFrame(() => (collapsed ? sidebarTabRef.current : sidebarCollapseRef.current)?.focus())
  }

  const navigate = (nextPage: Page) => {
    setPage(nextPage)
    setMobileNavOpen(false)
    window.history.pushState({}, '', pageToPath(nextPage))
    window.localStorage.setItem(PAGE_KEY, nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleFavourite = (toolPage: ToolPage) => {
    setFavourites((current) => {
      const next = current.includes(toolPage) ? current.filter((item) => item !== toolPage) : [...current, toolPage]
      window.localStorage.setItem(FAVOURITES_KEY, JSON.stringify(next))
      trackEvent('favourite_updated', { tool: PAGE_METADATA[toolPage].path.slice(1), action: next.includes(toolPage) ? 'added' : 'removed' })
      return next
    })
  }

  useEffect(() => {
    const legacyPage = window.location.hash.replace('#/', '')
    if (isPage(legacyPage)) {
      window.history.replaceState({}, '', pageToPath(legacyPage))
    }

    const handlePopState = () => setPage(pathToPage(window.location.pathname))
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (!toolPages.has(page as ToolPage)) return
    const toolPage = page as ToolPage
    setRecentTools((current) => {
      const next = [toolPage, ...current.filter((item) => item !== toolPage)].slice(0, 5)
      window.localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(next))
      return next
    })
    trackEvent('tool_opened', { tool: PAGE_METADATA[toolPage].path.slice(1) })
  }, [page])

  useEffect(() => {
    if (!mobileNavOpen) return
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const sidebar = sidebarRef.current
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const focusable = () => Array.from(sidebar?.querySelectorAll<HTMLElement>(focusableSelector) ?? [])
    const focusFrame = window.requestAnimationFrame(() => sidebar?.querySelector<HTMLElement>('.sidebar-close')?.focus())
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileNavOpen(false)
        return
      }
      if (event.key !== 'Tab') return
      const items = focusable()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      previousFocusRef.current?.focus()
    }
  }, [mobileNavOpen])

  useEffect(() => {
    const metadata = PAGE_METADATA[page]
    document.title = metadata.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description)
    document.querySelector('meta[name="robots"]')?.setAttribute('content', page === 'settings' ? 'noindex, follow' : 'index, follow')
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', metadata.title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', metadata.description)
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', metadata.title)
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', metadata.description)
    const canonicalUrl = `${SITE_URL}${pageToPath(page)}`
    const imageUrl = `${SITE_URL}${metadata.ogImage}`
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalUrl)
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl)
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', imageUrl)
    document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', imageUrl)
    window.gtag?.('event', 'page_view', { page_title: metadata.title, page_location: canonicalUrl })
  }, [page])

  const activeTool = tools.find((tool) => tool.page === page)

  return (
    <div className={`penguino-shell ${desktopSidebarCollapsed ? 'penguino-shell--sidebar-collapsed' : ''}`}>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <div aria-atomic="true" aria-live="polite" className="visually-hidden">{PAGE_METADATA[page].heading}</div>
      <header className="mobile-header">
        <button aria-controls="app-navigation" aria-expanded={mobileNavOpen} aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'} className="mobile-menu" onClick={() => setMobileNavOpen((open) => !open)} type="button"><Icon name="menu" /></button>
        <a className="brand-mark brand-mark--mobile" href="/" onClick={(event) => { event.preventDefault(); navigate('home') }}><img alt="" src="/assets/penguino-wave.webp" /><strong>Penguino<i>.</i></strong></a>
      </header>

      <aside aria-modal={mobileNavOpen || undefined} className={`app-sidebar ${mobileNavOpen ? 'app-sidebar--open' : ''}`} id="app-navigation" ref={sidebarRef} role={mobileNavOpen ? 'dialog' : undefined}>
        <div className="sidebar-top">
          <a className="brand-mark" href="/" onClick={(event) => { event.preventDefault(); navigate('home') }}><img alt="" src="/assets/penguino-wave.webp" /><strong>Penguino<i>.</i></strong></a>
          <button aria-controls="app-navigation" aria-expanded="true" aria-label="Hide navigation" className="desktop-sidebar-collapse" onClick={() => setDesktopSidebar(true)} ref={sidebarCollapseRef} title="Hide navigation" type="button"><Icon name="arrow" /></button>
          <button aria-label="Close navigation" className="sidebar-close" onClick={() => setMobileNavOpen(false)} type="button"><Icon name="close" /></button>
        </div>
        <nav className="sidebar-home" aria-label="Home navigation">
          <a aria-current={page === 'home' ? 'page' : undefined} className={page === 'home' ? 'nav-item nav-item--active' : 'nav-item'} href="/" onClick={(event) => { event.preventDefault(); navigate('home') }}><Icon name="home" /><span>Home</span></a>
        </nav>
        <SidebarTools favourites={favourites} onOpen={navigate} page={page} />
        <nav className="sidebar-secondary" aria-label="Secondary navigation">
          <a className={page === 'settings' ? 'nav-item nav-item--active' : 'nav-item'} href="/settings" onClick={(event) => { event.preventDefault(); navigate('settings') }}><Icon name="settings" /><span>Settings</span></a>
          <a className={page === 'about' ? 'nav-item nav-item--active' : 'nav-item'} href="/about" onClick={(event) => { event.preventDefault(); navigate('about') }}><Icon name="sparkles" /><span>About</span></a>
          <a className={page === 'terms' ? 'nav-item nav-item--active' : 'nav-item'} href="/terms" onClick={(event) => { event.preventDefault(); navigate('terms') }}><Icon name="document" /><span>Terms and Conditions</span></a>
        </nav>
        <p className="sidebar-copyright">© {new Date().getFullYear()} Penguino · Built by <a href="https://studiojwd.com/" rel="noopener noreferrer" target="_blank">StudioJWD</a></p>
      </aside>

      <button aria-controls="app-navigation" aria-expanded="false" aria-label="Show navigation" className="desktop-sidebar-tab" onClick={() => setDesktopSidebar(false)} ref={sidebarTabRef} title="Show navigation" type="button"><Icon name="menu" /></button>

      {mobileNavOpen ? <button aria-label="Close navigation" className="nav-scrim" onClick={() => setMobileNavOpen(false)} type="button" /> : null}

      <main className="app-content" id="main-content" tabIndex={-1}>
        {page !== 'home' ? <div className="tool-topbar"><button onClick={() => navigate('home')} type="button">All tools</button><span>/</span><strong>{page === 'settings' ? 'Settings' : page === 'about' ? 'About' : page === 'terms' ? 'Terms and Conditions' : activeTool?.title}</strong><i>{page === 'terms' ? 'Legal' : page === 'about' ? 'Our story' : 'Runs locally'}</i></div> : null}
        {page === 'home' ? <Dashboard favourites={favourites} onOpen={navigate} onToggleFavourite={toggleFavourite} recentTools={recentTools} /> : null}
        <Suspense fallback={<div className="tool-loading" role="status"><PenguinMascot /><strong>Opening tool...</strong></div>}>
          {page === 'text' ? <TextGraphicTool /> : null}
          {page === 'resize' ? <ImageResizerTool /> : null}
          {page === 'convert' ? <FileConverterTool /> : null}
          {page === 'optimise' ? <ImageOptimiserTool /> : null}
          {page === 'remove-background' ? <BackgroundRemoverTool /> : null}
          {page === 'favicon' ? <FaviconGeneratorTool /> : null}
          {page === 'bulk-resize' ? <BulkImageResizerTool /> : null}
          {page === 'pdf-compress' ? <PdfCompressorTool /> : null}
          {page === 'metadata' ? <MetadataRemoverTool /> : null}
          {page === 'pack' ? <FilePackerTool /> : null}
          {page === 'palette' ? <PaletteExtractorTool /> : null}
          {page === 'social-resize' ? <SocialMediaResizerTool /> : null}
          {page === 'pdf-merge' ? <PdfMergeExtractTool /> : null}
          {page === 'qr' ? <QrCodeGeneratorTool /> : null}
          {page === 'svg-optimise' ? <SvgOptimiserTool /> : null}
          {page === 'watermark' ? <WatermarkTool /> : null}
          {page === 'split' ? <ImageSplitterTool /> : null}
        </Suspense>
        {activeTool ? <RelatedTools onOpen={navigate} page={activeTool.page} /> : null}
        {activeTool ? <ToolIntro page={activeTool.page} /> : null}
        {page === 'settings' ? <SettingsPage /> : null}
        {page === 'about' ? <AboutPage /> : null}
        {page === 'terms' ? <TermsPage /> : null}
      </main>
    </div>
  )
}

export default App
