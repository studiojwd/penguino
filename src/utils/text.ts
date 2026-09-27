import type { EditorState } from '../types'

export const applyTextCase = (text: string, mode: EditorState['textCase']) => {
  if (mode === 'uppercase') {
    return text.toUpperCase()
  }

  if (mode === 'lowercase') {
    return text.toLowerCase()
  }

  if (mode === 'titlecase') {
    return text.replace(/\S+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  }

  return text
}

export const sanitizeDraftName = (lines: string[]) =>
  lines
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')
    .slice(0, 42) || 'Untitled graphic'
