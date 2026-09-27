import { useEffect, useState } from 'react'
import Icon, { type IconName } from './components/Icon'
import PenguinMascot from './components/PenguinMascot'
import FileConverterTool from './tools/FileConverterTool'
import ImageResizerTool from './tools/ImageResizerTool'
import TextGraphicTool from './tools/TextGraphicTool'

type Page = 'home' | 'text' | 'resize' | 'convert' | 'settings' | 'terms'

const PAGE_KEY = 'penguino/active-page/v1'

const tools: Array<{
  page: Exclude<Page, 'home'>
  path: string
  icon: IconName
  eyebrow: string
  title: string
  description: string
  tone: string
  artwork: string
}> = [
  { page: 'text', path: '/text-graphic', icon: 'type', eyebrow: 'Create', title: 'Text graphic', description: 'Turn words into crisp, on-brand graphics.', tone: 'orange', artwork: '/assets/penguino-text.png' },
  { page: 'resize', path: '/image-resizer', icon: 'resize', eyebrow: 'Resize', title: 'Image resizer', description: 'Resize images to exact pixel dimensions.', tone: 'blue', artwork: '/assets/penguino-resize.png' },
  { page: 'convert', path: '/file-converter', icon: 'convert', eyebrow: 'Convert', title: 'File converter', description: 'Switch between PNG, JPEG and WebP.', tone: 'pink', artwork: '/assets/penguino-convert.png' }
]

const pathToPage = (pathname: string): Page => {
  if (pathname === '/text-graphic') return 'text'
  if (pathname === '/image-resizer') return 'resize'
  if (pathname === '/file-converter') return 'convert'
  if (pathname === '/settings') return 'settings'
  if (pathname === '/terms') return 'terms'
  return 'home'
}

const pageToPath = (page: Page) => {
  if (page === 'settings') return '/settings'
  if (page === 'terms') return '/terms'
  return tools.find((tool) => tool.page === page)?.path ?? '/'
}

const readInitialPage = (): Page => {
  const hash = window.location.hash.replace('#/', '') as Page
  if (['home', 'text', 'resize', 'convert', 'settings', 'terms'].includes(hash)) return hash
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
            <span className="tool-card__visual"><img alt="" src={tool.artwork} /><i /></span>
            <span className="tool-card__copy"><small>{tool.eyebrow}</small><strong>{tool.title}</strong><span>{tool.description}</span></span>
            <span className="tool-card__arrow"><Icon name="arrow" /></span>
          </a>
        ))}
      </div>
    </section>

    <section className="privacy-note"><span><Icon name="sparkles" /></span><div><strong>Creative work, kept private.</strong><p>Penguino runs locally. Your images and brand presets never need to leave this browser.</p></div></section>
  </div>
)

const PlaceholderPage = ({ type }: { type: 'settings' | 'terms' }) => {
  const isSettings = type === 'settings'
  return (
    <div className="placeholder-page">
      <section className="placeholder-card">
        <span className={`placeholder-card__icon ${isSettings ? 'placeholder-card__icon--settings' : 'placeholder-card__icon--terms'}`}>
          <Icon name={isSettings ? 'settings' : 'document'} />
        </span>
        <p>{isSettings ? 'Preferences' : 'Legal'}</p>
        <h1>{isSettings ? 'Settings' : 'Terms and Conditions'}</h1>
        <p className="placeholder-card__intro">
          {isSettings
            ? 'Settings and preferences will live here.'
            : 'The Penguino terms and conditions will be added here.'}
        </p>
        <span className="placeholder-card__status">Content coming shortly</span>
      </section>
    </div>
  )
}

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
    if (['home', 'text', 'resize', 'convert', 'settings', 'terms'].includes(legacyPage)) {
      window.history.replaceState({}, '', pageToPath(legacyPage))
    }

    const handlePopState = () => setPage(pathToPage(window.location.pathname))
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const activeTool = tools.find((tool) => tool.page === page)

  useEffect(() => {
    const pageTitle = page === 'settings' ? 'Settings' : page === 'terms' ? 'Terms and Conditions' : activeTool?.title
    const title = page === 'home' ? 'Penguino — Creative tools made easier' : `${pageTitle} — Penguino`
    const description = page === 'home'
      ? 'Private browser-based tools for creating text graphics, resizing images and converting image files.'
      : page === 'settings'
        ? 'Penguino settings and preferences.'
        : page === 'terms'
          ? 'Penguino terms and conditions.'
          : activeTool?.description ?? ''
    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [activeTool, page])

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
          <a className={page === 'terms' ? 'nav-item nav-item--active' : 'nav-item'} href="/terms" onClick={(event) => { event.preventDefault(); navigate('terms') }}><Icon name="document" /><span>Terms and Conditions</span></a>
        </nav>
      </aside>

      {mobileNavOpen ? <button aria-label="Close navigation" className="nav-scrim" onClick={() => setMobileNavOpen(false)} type="button" /> : null}

      <main className="app-content">
        {page !== 'home' ? <div className="tool-topbar"><button onClick={() => navigate('home')} type="button">All tools</button><span>/</span><strong>{page === 'settings' ? 'Settings' : page === 'terms' ? 'Terms and Conditions' : activeTool?.title}</strong><i>{page === 'terms' ? 'Legal' : 'Runs locally'}</i></div> : null}
        {page === 'home' ? <Dashboard onOpen={navigate} /> : null}
        {page === 'text' ? <TextGraphicTool /> : null}
        {page === 'resize' ? <ImageResizerTool /> : null}
        {page === 'convert' ? <FileConverterTool /> : null}
        {page === 'settings' ? <PlaceholderPage type="settings" /> : null}
        {page === 'terms' ? <PlaceholderPage type="terms" /> : null}
        <footer className="app-footer">© {new Date().getFullYear()} Penguino · Built by <a href="https://studiojwd.com" rel="noopener noreferrer" target="_blank">StudioJWD</a></footer>
      </main>
    </div>
  )
}

export default App
