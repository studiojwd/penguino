import { useEffect, useState } from 'react'
import Icon, { type IconName } from './components/Icon'
import PenguinMascot from './components/PenguinMascot'
import FileConverterTool from './tools/FileConverterTool'
import FaviconGeneratorTool from './tools/FaviconGeneratorTool'
import BulkImageResizerTool from './tools/BulkImageResizerTool'
import ImageResizerTool from './tools/ImageResizerTool'
import PdfCompressorTool from './tools/PdfCompressorTool'
import TextGraphicTool from './tools/TextGraphicTool'

type ToolPage = 'text' | 'resize' | 'convert' | 'favicon' | 'bulk-resize' | 'pdf-compress'
type Page = 'home' | ToolPage | 'settings' | 'about' | 'terms'

const PAGE_KEY = 'penguino/active-page/v1'

const PAGE_METADATA: Record<Page, { title: string; description: string }> = {
  home: {
    title: 'Penguino | Free Browser-Based Creative Tools',
    description: "Create text graphics, resize and convert images, generate favicons, and compress PDFs with Penguino's private browser-based tools."
  },
  text: {
    title: 'Text Graphic Maker | Penguino',
    description: 'Create crisp branded text graphics with custom fonts, colours, spacing and export sizes, directly in your browser.'
  },
  resize: {
    title: 'Free Image Resizer | Penguino',
    description: 'Resize an image to exact pixel dimensions and download it as PNG, JPEG or WebP without uploading your file.'
  },
  convert: {
    title: 'Free Image File Converter | Penguino',
    description: 'Convert images between PNG, JPEG and WebP formats privately in your browser with adjustable export quality.'
  },
  favicon: {
    title: 'Free Favicon Generator | Penguino',
    description: 'Generate a complete favicon package with browser icons, Apple Touch icons, Android icons, a manifest and HTML markup.'
  },
  'bulk-resize': {
    title: 'Free Bulk Image Resizer | Penguino',
    description: 'Resize up to 10 PNG, JPEG or WebP images together using shared dimensions, format and quality settings.'
  },
  'pdf-compress': {
    title: 'Free PDF Compressor | Penguino',
    description: 'Reduce PDF file sizes locally in your browser with a choice of compression levels and no document upload.'
  },
  settings: {
    title: 'Settings | Penguino',
    description: 'Manage your Penguino creative toolkit settings and browser-based preferences.'
  },
  about: {
    title: 'About Penguino | Simple, Free Creative Tools',
    description: 'Meet Penguino, a collection of free, thoughtfully designed tools for designers, marketers and anyone who wants to get simple digital jobs done.'
  },
  terms: {
    title: 'Terms and Conditions | Penguino',
    description: 'Read the terms and conditions for using the Penguino browser-based creative toolkit.'
  }
}

const tools: Array<{
  page: ToolPage
  path: string
  icon: IconName
  eyebrow: string
  title: string
  description: string
  tone: string
  artwork?: string
  artworkPosition?: 'left' | 'center' | 'right'
}> = [
  { page: 'text', path: '/text-graphic', icon: 'type', eyebrow: 'Create', title: 'Text graphic', description: 'Turn words into crisp, on-brand graphics.', tone: 'orange', artwork: '/assets/penguino-text.png' },
  { page: 'resize', path: '/image-resizer', icon: 'resize', eyebrow: 'Resize', title: 'Image resizer', description: 'Resize images to exact pixel dimensions.', tone: 'blue', artwork: '/assets/penguino-resize.png' },
  { page: 'convert', path: '/file-converter', icon: 'convert', eyebrow: 'Convert', title: 'File converter', description: 'Switch between PNG, JPEG and WebP.', tone: 'pink', artwork: '/assets/penguino-convert.png' },
  { page: 'favicon', path: '/favicon-generator', icon: 'favicon', eyebrow: 'Create', title: 'Favicon generator', description: 'Create a complete favicon package from one image.', tone: 'yellow', artwork: '/assets/penguino-new-tools.png', artworkPosition: 'left' },
  { page: 'bulk-resize', path: '/bulk-image-resizer', icon: 'layers', eyebrow: 'Resize', title: 'Bulk image resizer', description: 'Resize multiple images with one set of dimensions.', tone: 'mint', artwork: '/assets/penguino-new-tools.png', artworkPosition: 'center' },
  { page: 'pdf-compress', path: '/pdf-compressor', icon: 'pdf', eyebrow: 'Compress', title: 'PDF compressor', description: 'Reduce PDF file size locally in your browser.', tone: 'lavender', artwork: '/assets/penguino-new-tools.png', artworkPosition: 'right' }
]

const pathToPage = (pathname: string): Page => {
  if (pathname === '/text-graphic') return 'text'
  if (pathname === '/image-resizer') return 'resize'
  if (pathname === '/file-converter') return 'convert'
  if (pathname === '/favicon-generator') return 'favicon'
  if (pathname === '/bulk-image-resizer') return 'bulk-resize'
  if (pathname === '/pdf-compressor') return 'pdf-compress'
  if (pathname === '/settings') return 'settings'
  if (pathname === '/about') return 'about'
  if (pathname === '/terms') return 'terms'
  return 'home'
}

const pageToPath = (page: Page) => {
  if (page === 'settings') return '/settings'
  if (page === 'about') return '/about'
  if (page === 'terms') return '/terms'
  return tools.find((tool) => tool.page === page)?.path ?? '/'
}

const readInitialPage = (): Page => {
  const hash = window.location.hash.replace('#/', '') as Page
  if (['home', 'text', 'resize', 'convert', 'favicon', 'bulk-resize', 'pdf-compress', 'settings', 'about', 'terms'].includes(hash)) return hash
  return pathToPage(window.location.pathname)
}

const Dashboard = ({ onOpen }: { onOpen: (page: Page) => void }) => (
  <div className="dashboard">
    <section className="dashboard-hero">
      <div className="dashboard-hero__copy">
        <p className="dashboard-kicker">Your creative toolkit</p>
        <h1>Create. Resize.<br />Convert.</h1>
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

    <section className="tool-grid" aria-labelledby="tools-heading">
      <div className="section-heading"><div><p>Pick a tool</p><h2 id="tools-heading">What are we making today?</h2></div><span>Everything stays on your device</span></div>
      <div className="tool-card-grid">
        {tools.map((tool, index) => (
          <a className={`tool-card tool-card--${tool.tone}`} href={tool.path} key={tool.page} onClick={(event) => { event.preventDefault(); onOpen(tool.page) }} style={{ animationDelay: `${index * 80}ms` }}>
            <span className="tool-card__visual">{tool.artwork ? <img alt="" className={tool.artworkPosition ? 'tool-card__sprite-artwork' : undefined} src={tool.artwork} style={tool.artworkPosition ? { objectPosition: tool.artworkPosition } : undefined} /> : <span className="tool-card__placeholder"><Icon name={tool.icon} /></span>}<i /></span>
            <span className="tool-card__copy"><small>{tool.eyebrow}</small><strong>{tool.title}</strong><span>{tool.description}</span></span>
            <span className="tool-card__arrow"><Icon name="arrow" /></span>
          </a>
        ))}
      </div>
    </section>

    <section className="privacy-note"><span><Icon name="sparkles" /></span><div><strong>Creative work, kept private.</strong><p>Penguino runs locally. Your images and brand presets never need to leave this browser.</p></div></section>
  </div>
)

const SettingsPage = () => {
  return (
    <div className="placeholder-page">
      <section className="placeholder-card">
        <span className="placeholder-card__icon"><Icon name="settings" /></span>
        <p>Preferences</p>
        <h1>Settings</h1>
        <p className="placeholder-card__intro">Settings and preferences will live here.</p>
        <span className="placeholder-card__status">Content coming shortly</span>
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

const App = () => {
  const [page, setPage] = useState<Page>(readInitialPage)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const navigate = (nextPage: Page) => {
    setPage(nextPage)
    setMobileNavOpen(false)
    window.history.pushState({}, '', pageToPath(nextPage))
    window.localStorage.setItem(PAGE_KEY, nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const legacyPage = window.location.hash.replace('#/', '') as Page
    if (['home', 'text', 'resize', 'convert', 'favicon', 'bulk-resize', 'pdf-compress', 'settings', 'about', 'terms'].includes(legacyPage)) {
      window.history.replaceState({}, '', pageToPath(legacyPage))
    }

    const handlePopState = () => setPage(pathToPage(window.location.pathname))
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const metadata = PAGE_METADATA[page]
    document.title = metadata.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', metadata.title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', metadata.description)
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', metadata.title)
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', metadata.description)
  }, [page])

  const activeTool = tools.find((tool) => tool.page === page)

  return (
    <div className="penguino-shell">
      <header className="mobile-header">
        <button aria-label="Open navigation" className="mobile-menu" onClick={() => setMobileNavOpen(true)} type="button"><Icon name="menu" /></button>
        <a className="brand-mark brand-mark--mobile" href="/" onClick={(event) => { event.preventDefault(); navigate('home') }}><img alt="" src="/assets/penguino-wave.png" /><strong>Penguino<i>.</i></strong></a>
      </header>

      <aside className={`app-sidebar ${mobileNavOpen ? 'app-sidebar--open' : ''}`}>
        <div className="sidebar-top">
          <a className="brand-mark" href="/" onClick={(event) => { event.preventDefault(); navigate('home') }}><img alt="" src="/assets/penguino-wave.png" /><strong>Penguino<i>.</i></strong></a>
          <button aria-label="Close navigation" className="sidebar-close" onClick={() => setMobileNavOpen(false)} type="button"><Icon name="close" /></button>
        </div>
        <nav aria-label="Main navigation">
          <a className={page === 'home' ? 'nav-item nav-item--active' : 'nav-item'} href="/" onClick={(event) => { event.preventDefault(); navigate('home') }}><Icon name="home" /><span>Home</span></a>
          {tools.map((tool) => <a className={page === tool.page ? 'nav-item nav-item--active' : 'nav-item'} href={tool.path} key={tool.page} onClick={(event) => { event.preventDefault(); navigate(tool.page) }}><Icon name={tool.icon} /><span>{tool.title}</span></a>)}
        </nav>
        <nav className="sidebar-secondary" aria-label="Secondary navigation">
          <a className={page === 'settings' ? 'nav-item nav-item--active' : 'nav-item'} href="/settings" onClick={(event) => { event.preventDefault(); navigate('settings') }}><Icon name="settings" /><span>Settings</span></a>
          <a className={page === 'about' ? 'nav-item nav-item--active' : 'nav-item'} href="/about" onClick={(event) => { event.preventDefault(); navigate('about') }}><Icon name="sparkles" /><span>About</span></a>
          <a className={page === 'terms' ? 'nav-item nav-item--active' : 'nav-item'} href="/terms" onClick={(event) => { event.preventDefault(); navigate('terms') }}><Icon name="document" /><span>Terms and Conditions</span></a>
        </nav>
        <p className="sidebar-copyright">© {new Date().getFullYear()} Penguino · Built by <a href="https://studiojwd.com/" rel="noopener noreferrer" target="_blank">StudioJWD</a></p>
      </aside>

      {mobileNavOpen ? <button aria-label="Close navigation" className="nav-scrim" onClick={() => setMobileNavOpen(false)} type="button" /> : null}

      <main className="app-content">
        {page !== 'home' ? <div className="tool-topbar"><button onClick={() => navigate('home')} type="button">All tools</button><span>/</span><strong>{page === 'settings' ? 'Settings' : page === 'about' ? 'About' : page === 'terms' ? 'Terms and Conditions' : activeTool?.title}</strong><i>{page === 'terms' ? 'Legal' : page === 'about' ? 'Our story' : 'Runs locally'}</i></div> : null}
        {page === 'home' ? <Dashboard onOpen={navigate} /> : null}
        {page === 'text' ? <TextGraphicTool /> : null}
        {page === 'resize' ? <ImageResizerTool /> : null}
        {page === 'convert' ? <FileConverterTool /> : null}
        {page === 'favicon' ? <FaviconGeneratorTool /> : null}
        {page === 'bulk-resize' ? <BulkImageResizerTool /> : null}
        {page === 'pdf-compress' ? <PdfCompressorTool /> : null}
        {page === 'settings' ? <SettingsPage /> : null}
        {page === 'about' ? <AboutPage /> : null}
        {page === 'terms' ? <TermsPage /> : null}
      </main>
    </div>
  )
}

export default App
