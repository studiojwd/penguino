const parseChannelValues = (value: string) => {
  if (value.startsWith('#')) {
    const normalized = value.slice(1)
    const pairs =
      normalized.length === 3
        ? normalized.split('').map((part) => `${part}${part}`)
        : [normalized.slice(0, 2), normalized.slice(2, 4), normalized.slice(4, 6)]

    if (pairs.length === 3) {
      return pairs.map((part) => Number.parseInt(part, 16))
    }
  }

  const matches = value.match(/\d+/g)
  if (!matches || matches.length < 3) {
    return null
  }

  return matches.slice(0, 3).map((part) => Number(part))
}

const toLuminance = (color: string) => {
  const channels = parseChannelValues(color)
  if (!channels) {
    return null
  }

  const [red, green, blue] = channels.map((channel) => {
    const normalized = channel / 255
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

export const getContrastRatio = (foreground: string, background: string) => {
  const foregroundLuminance = toLuminance(foreground)
  const backgroundLuminance = toLuminance(background)

  if (foregroundLuminance === null || backgroundLuminance === null) {
    return null
  }

  const lighter = Math.max(foregroundLuminance, backgroundLuminance)
  const darker = Math.min(foregroundLuminance, backgroundLuminance)
  return (lighter + 0.05) / (darker + 0.05)
}
