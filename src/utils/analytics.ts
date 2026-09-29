type AnalyticsValue = string | number | boolean

export const trackEvent = (name: string, parameters: Record<string, AnalyticsValue> = {}) => {
  window.gtag?.('event', name, parameters)
}

export const currentToolPath = () => window.location.pathname.replace(/^\//, '') || 'home'
