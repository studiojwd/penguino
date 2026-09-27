import { getSupportedFontWeights } from '../constants'

const loadedRequests = new Set<string>()

const ensurePreconnect = (id: string, href: string, crossOrigin?: string) => {
  if (document.getElementById(id)) {
    return
  }

  const link = document.createElement('link')
  link.id = id
  link.rel = 'preconnect'
  link.href = href
  if (crossOrigin) {
    link.crossOrigin = crossOrigin
  }
  document.head.appendChild(link)
}

const buildFontCssUrl = (family: string) => {
  const encodedFamily = family.trim().split(/\s+/).join('+')
  const weights = getSupportedFontWeights(family)
  return `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@${weights.join(';')}&display=swap`
}

export const ensureGoogleFontLoaded = async (family: string) => {
  if (!family) {
    return
  }

  const requestKey = `${family}:${getSupportedFontWeights(family).join(',')}`

  if (!loadedRequests.has(requestKey)) {
    const linkId = `google-font-${family.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    if (!document.getElementById(linkId)) {
      ensurePreconnect('google-fonts-preconnect', 'https://fonts.googleapis.com')
      ensurePreconnect('google-fonts-static-preconnect', 'https://fonts.gstatic.com', 'anonymous')

      const link = document.createElement('link')
      link.id = linkId
      link.rel = 'stylesheet'
      link.href = buildFontCssUrl(family)
      document.head.appendChild(link)
    }
    loadedRequests.add(requestKey)
  }

  if ('fonts' in document) {
    await Promise.all(
      getSupportedFontWeights(family).map((weight) => document.fonts.load(`${weight} 16px "${family}"`)),
    )
  }
}
